const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const authenticate = require('../middleware/authenticate');
const upload = require('../middleware/multer');

const Registration = require('../model/userSchema');
const contactMessage = require('../model/messageSchema');
const Blog = require('../model/blogSchema');
const TrendingBlog = require('../model/trendingBlogSchema');
const PostedBlog = require('../model/postedBlogSchema');
const Review = require('../model/reviewSchema');
const News = require('../model/newsSchema');
const UserUploads = require('../model/uploadSchema');
const topclg = require('../data/topclg');
const clgData = require('../data/colleges');
const branchsem = require('../data/banchsem.json');
const subjects = require('../data/subjects.json');
const units = require('../data/units.json');
const academicsData = [branchsem, subjects, units];
const API = 'http://127.0.0.1:8000';

router.get('/', (req, res) => {
    res.send('HomePage - Express');
})

router.get('/searchcolleges', (req, res) => {
    res.status(200).json(clgData);
})

router.get('/academics', (req, res) => {
    res.status(200).json(academicsData);
})

router.get('/topclg', (req, res) => {
    res.status(200).json(topclg);
})

router.get('/news', async (req, res) => {
    try {
        const result = await News.find();
        if (result) res.status(200).json(result);
        else res.status(500).json({ message: 'Internal error' });
    } catch (err) {
        console.log(err);
    }
})

router.get('/academicsposted', async (req, res) => {
    try {
        const result = await UserUploads.find();
        if (result) res.status(201).json(result);
        else res.status(500).json({ message: 'Error occured fetching the data' });
    } catch (err) {
        console.log(err);
    }
})

router.get('*', (req, res) => {
    res.send('404 - Not found');
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) return res.status(400).json({ message: "Please fill the data" });

        const userLogin = await Registration.findOne({ username });
        if (userLogin) {
            const isMatch = await bcrypt.compare(password, userLogin.password);
            if (!isMatch) res.status(400).json({ message: "Invalid Credentials" });
            else {
                let token = await userLogin.generateAuthToken();
                res.status(201).json({ jwtoken: token, message: "signin successfully", usrname: userLogin.username });
            }
        } else res.status(400).json({ message: "Invalid Credentials" });
    } catch (err) {
        console.log(err);
    }
})

router.post('/register', async (req, res) => {
    const { name, number, email, username, password, cpassword, gender } = req.body;
    if (!name || !number || !email || !username || !password || !cpassword || !gender) {
        return res.status(422).json({ message: 'Please fill the form properly' });
    }
    try {
        const mailExist = await Registration.findOne({ email });
        const numExist = await Registration.findOne({ number });
        const usrnameExist = await Registration.findOne({ username });

        if (mailExist) res.status(422).json({ message: 'Email already exists' });
        else if (numExist) res.status(422).json({ message: 'Number already exists' });
        else if (usrnameExist) res.status(422).json({ message: 'Username already exists' });
        else if (password != cpassword) res.status(422).json({ message: 'Password not matching' });
        else {
            const user = new Registration({ name, number, email, username, password, cpassword, gender });
            await user.generateAuthToken();
            const userRegister = await user.save();

            if (userRegister) res.status(201).json({ message: 'User registered successfully' });
            else res.status(500).json({ message: 'Failed to register' });
        }
    } catch (err) {
        console.log(err);
    };
})

router.post('/confidential', authenticate, (req, res) => {
    res.send("Authentication successful");
})

router.post('/getcontact', authenticate, (req, res) => {
    res.send(req.rootUser);
})

router.post('/getmessage', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) return res.status(422).json({ message: 'Please fill the form properly' });
    try {
        const userContact = await Registration.findOne({ email });
        if (userContact) {
            await userContact.addMessage(name, email, message);
            const saveStatus = await userContact.save();
            if (saveStatus) res.status(201).json({ message: 'Message Sent' });
            else res.status(500).json({ message: 'Internal error' });
        } else {
            const userMessage = new contactMessage({ name, email, message });
            const messageSave = await userMessage.save();

            if (messageSave) res.status(201).json({ message: 'Message Sent' });
            else res.status(500).json({ message: 'Internal error' });
        }
    } catch (err) {
        console.log(err);
    }
})

router.post('/blogs', async (req, res) => {
    const { type } = req.body;
    if (type === 'post') {
        const { heading, blog, category, author, gender } = req.body.data;
        if (!heading || !blog || !category || !author || !gender) return res.status(422).json({ message: 'Enter data properly' });
        else {
            try {
                const result = new PostedBlog(req.body.data);
                const reslt = await result.save();
                if (reslt) res.status(201).json({ message: 'Posted Successfully' });
                else res.status(500).json({ message: 'Internal error' });
            } catch (err) {
                console.log(err);
            }
        }
    }
    if (type === 'get') {
        let blog, postedBlog, trendingBlog;
        const getData = async () => {
            try {
                blog = await Blog.find();
                postedBlog = await PostedBlog.find();
                trendingBlog = await TrendingBlog.find();
                if (blog && postedBlog && trendingBlog) res.status(201).json({ blog, postedBlog, trendingBlog });
                else res.status(500).json({ message: 'Error occured while fetching the data' });
            } catch (err) {
                console.log(err);
            }
        }
        getData();
    }
})

router.post('/updateprofile', authenticate, async (req, res) => {
    const { name, email, number, username, gender } = req.body.data;
    if (!name || !email || !number || !username || !gender) return res.status(422).json({ message: 'Enter data properly' });
    const uniqueID = req.uniqueID;
    const secretKey = process.env.SECRET;
    let mailToken, numToken, usrnameToken, existMail, existNum, existUsrname;

    try {
        const mailExist = await Registration.findOne({ email });
        const numExist = await Registration.findOne({ number });
        const usrnameExist = await Registration.findOne({ username });

        if (mailExist) {
            mailToken = mailExist.tokens[0].token;
            const verification = jwt.verify(mailToken, secretKey);
            if (uniqueID !== verification._id) existMail = 'true';
        }
        if (numExist) {
            numToken = numExist.tokens[0].token;
            const verification = jwt.verify(numToken, secretKey);
            if (uniqueID !== verification._id) existNum = 'true';
        }
        if (usrnameExist) {
            usrnameToken = usrnameExist.tokens[0].token;
            const verification = jwt.verify(usrnameToken, secretKey);
            if (uniqueID !== verification._id) existUsrname = 'true';
        }
        if (existMail === 'true') res.status(422).json({ message: 'Email already exists' });
        else if (existNum === 'true') res.status(422).json({ message: 'Number already exists' });
        else if (existUsrname === 'true') res.status(422).json({ message: 'Username already exists' });
        else {
            const result = await Registration.updateOne({ _id: req.uniqueID }, {
                $set: { name, email, number, username, gender }
            })
            if (result) res.status(201).json({ message: 'Updated' });
            else res.status(500).json({ message: 'Failed' });
        }
    } catch (err) {
        console.log(err);
    }
})

router.post('/changepassword', authenticate, async (req, res) => {
    const { curpass, newpass, cnewpass } = req.body.data2;
    if (!curpass || !newpass || !cnewpass) return res.status(422).json({ message: 'Enter data properly' });
    if (newpass !== cnewpass) return res.status(422).json({ message: 'Password not matching' });
    let hashedPass, hashedPass2;
    try {
        const isMatch = await bcrypt.compare(curpass, req.rootUser.password);
        if (!isMatch) res.status(400).json({ message: "Invalid current password" });
        else {
            hashedPass = await bcrypt.hash(newpass, 12);
            hashedPass2 = await bcrypt.hash(cnewpass, 12);
            const check = await Registration.updateOne({ _id: req.uniqueID }, {
                $set: { password: hashedPass, cpassword: hashedPass2 }
            })
            if (check) res.status(201).json({ message: 'Password Changed' });
            else res.status(500).json({ message: 'Failed' });
        }
    } catch (err) {
        console.log(err);
    }
})

router.post('/logoutall', async (req, res) => {
    if (!req.body.data) return res.status(422).json({ message: 'Enter data properly' });
    const logOutAll = async username => {
        try {
            const result = await Registration.updateOne({ username }, {
                $unset: {
                    tokens: ''
                }
            })
            if (result) res.status(201).json({ message: 'Signed Out' });
            else res.status(500).json({ message: 'Error Occured' });
        } catch (err) {
            console.log(err);
        }
    }
    logOutAll(req.body.data);
})

router.post('/reviews', async (req, res) => {
    if (req.body.type === 'get') {
        let reviews;
        try {
            reviews = await Review.find();
            if (reviews) res.status(201).json({ reviews });
            else res.status(500).json({ message: 'Error occured fetching the data' });
        } catch (err) {
            console.log(err);
        }
    } else {
        const { name, review, stars } = req.body.data;
        if (!name || !review || !stars) return res.status(422).json({ message: 'Enter data properly' });
        try {
            const status = new Review(req.body.data);
            const result = await status.save();
            if (result) res.status(201).json({ message: 'Posted' });
            else res.status(500).json({ message: 'Failed' });
        } catch (err) {
            console.log(err);
        }
    }
})

router.post('/addcollege', (req, res) => {
    const { college, course, fee, city, state, logo, link } = req.body;
    if (!college || !course || !fee || !city || !state || !logo || !link) return res.status(422).json({ message: 'Enter data properly' });
    else {
        fs.readFile(`${__dirname}/../data/colleges.json`, 'utf-8', (err, data) => {
            if (err) res.status(500).json({ message: 'Internal Error' });
            else {
                let getData = JSON.parse(data);
                getData.push({ title: college, logo, location: `${city}, ${state}`, url: `https://www.${link}`, reviews: '', rating: '', fee: `₹ ${fee}`, course, city, bycourse: course, state });
                finalData = JSON.stringify(getData)
                fs.writeFile(`${__dirname}/../data/colleges.json`, finalData, err => {
                    if (err) res.status(500).json({ message: 'Internal Error' });
                    else res.status(201).json({ message: 'Added Successfully' });
                })
            }
        })
    }
})

router.post('/academics', upload.single('file'), async (req, res) => {
    const { title, content } = req.body;
    if (!title || !content) return res.status(422).json({ message: 'Enter data properly' });
    else {
        const user = await Registration.findOne({ _id: req.headers.id });
        if (user) {
            const { name, gender } = user;
            const status = new UserUploads({ title, content, path: `${API}${req.file.path.slice(7)}`, name, gender });
            const resp = status.save();
            if (resp) res.status(201).json({ message: 'Posted Successfully' });
            else res.status(500).json({ message: 'Internal Error' });
        }
    }
})

module.exports = router;