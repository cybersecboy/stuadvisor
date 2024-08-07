import React, { useEffect, useState, useContext } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { SignOut, SiteContext } from '../App';
import SignIn from './SignIn';
import SignUp from './SignUp';
import SearchBlog from './SearchBlog';
import TrendingBlogs from './TrendingBlogs';
import DataPosted2 from './DataPosted2';
const API = process.env.REACT_APP_API;

const Blogs = () => {
  const { state } = useContext(SiteContext);
  const handleSignOut = useContext(SignOut);
  const [data, setData] = useState(0);
  const { key } = useOutletContext();
  const [dataAPI, setDataAPI] = useState({});

  const { blog, postedBlog, trendingBlog } = dataAPI;

  const menuClick = id => {
    setData(id);
  }

  const getData = async url => {
    try {
      const res = await axios.post(url, { type: 'get' });
      setDataAPI(res.data);
    } catch (err) {
      console.log(err.response.data.message);
    }
  }

  const blogsData = [{ text: 'Search', icon: <i className="i-tag fa-sharp fa-solid fa-magnifying-glass"></i>, click: menuClick }, { text: 'Trending Blogs', icon: <i className="i-tag fa-solid fa-fire"></i>, click: menuClick }, { text: 'Edu Blogs', icon: <i className="i-tag fa-brands fa-blogger-b"></i>, click: menuClick }, { text: 'Other', icon: <i className="i-tag fa-solid fa-blog"></i>, click: menuClick }, { text: 'Data Posted', icon: <i className="i-tag fa-solid fa-server"></i>, click: menuClick }]

  const blogsMenu = [...blogsData, { text: 'Sign in', icon: <i className="i-tag fa-solid fa-door-open"></i>, click: menuClick }, { text: 'Sign up', icon: <i className="i-tag fa-solid fa-user-plus"></i>, click: menuClick }];

  const blogsMenu2 = [...blogsData, { text: 'Sign out', icon: <i className="i-tag fa-solid fa-right-from-bracket"></i>, click: handleSignOut }];

  useEffect(() => {
    document.title = 'Blogs';
    if (state) key(blogsMenu2);
    else key(blogsMenu);
    getData(`${API}/blogs`);
    // eslint-disable-next-line
  }, [])

  const searchblog = {
    heading: <span className='search-span'><span>S</span>earch <span>f</span>or <span>b</span>logs...</span>,
    ph: 'search blogs',
    handleComp: 'searchblog',
    datadb: { blog, postedBlog }
  }

  const edublog = {
    heading: <span className='search-span'><span>S</span>earch <span>f</span>or <span>e</span>du <span>b</span>logs...</span>,
    ph: 'search edu blogs',
    handleComp: 'edublog',
    datadb: { blog, postedBlog }
  }

  const otherblog = {
    heading: <span className='search-span'><span>S</span>earch <span>o</span>ther <span>b</span>logs...</span>,
    ph: 'search blogs',
    handleComp: 'otherblog',
    datadb: { blog, postedBlog }
  }

  return (
    <>
      <div className="main-item main-right">
        {data === 0 ? <SearchBlog {...searchblog} /> : null}
        {data === 1 ? <TrendingBlogs data={trendingBlog} /> : null}
        {data === 2 ? <SearchBlog {...edublog} /> : null}
        {data === 3 ? <SearchBlog {...otherblog} /> : null}
        {data === 4 ? <DataPosted2 data={postedBlog} /> : null}
        {data === 5 ? <SignIn /> : null}
        {data === 6 ? <SignUp /> : null}
      </div>
    </>
  )
}

export default Blogs;