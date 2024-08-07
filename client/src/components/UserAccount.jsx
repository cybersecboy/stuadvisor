import React, { useEffect, useState, useContext } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { SignOut } from '../App';
import { Nav2Data } from './Template';
import axios from 'axios';
import PostAcademics from './PostAcademics';
import PostBlogs from './PostBlogs';
import PostReview from './PostReview';
import AddCollege from './AddCollege';
import EditProfile from './EditProfile';
const API = process.env.REACT_APP_API;

const UserAccount = () => {
  const navData = useContext(Nav2Data);
  const handleSignOut = useContext(SignOut);
  const [data, setData] = useState(0);
  let { key } = useOutletContext();
  const navigate = useNavigate();
  const [info, setInfo] = useState({});

  const menuClick = id => {
    setData(id);
  }

  const callConfidential = async url => {
    const token = localStorage.getItem('jwtoken');
    const data = { token };
    try {
      await axios.post(url, data);
    } catch (err) {
      console.log(err.response.data);
      navData('Home');
      navigate('/');
    }
  }

  const userContact = async url => {
    const token = localStorage.getItem('jwtoken');
    try {
      const res = await axios.post(url, { token });
      setInfo(res.data);
    } catch (err) { }
  }

  const userMenu = [{ text: 'Post Academics', icon: <i className="i-tag fa-solid fa-book"></i>, click: menuClick }, { text: 'Post Blogs', icon: <i className="i-tag fa-solid fa-blog"></i>, click: menuClick }, { text: 'Post Review', icon: <i className="i-tag fa-regular fa-comments"></i>, click: menuClick }, { text: 'Add College', icon: <i className="i-tag fa-solid fa-graduation-cap"></i>, click: menuClick }, { text: 'Edit Profile', icon: <i className="i-tag fa-solid fa-address-book"></i>, click: menuClick }, { text: 'Sign out', icon: <i className="i-tag fa-solid fa-right-from-bracket"></i>, click: handleSignOut }];

  useEffect(() => {
    document.title = 'My Account';
    callConfidential(`${API}/confidential`);
    userContact(`${API}/getcontact`);
    key(userMenu);
    // eslint-disable-next-line
  }, [])

  return (
    <>
      <div className="main-item main-right">
        {data === 0 ? <PostAcademics resp={info} /> : null}
        {data === 1 ? <PostBlogs resp={info} /> : null}
        {data === 2 ? <PostReview resp={info} /> : null}
        {data === 3 ? <AddCollege /> : null}
        {data === 4 ? <EditProfile resp={info} /> : null}
      </div>
    </>
  )
}

export default UserAccount;