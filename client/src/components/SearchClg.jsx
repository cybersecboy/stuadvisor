import React, { useState, useEffect } from 'react';
import searchImg from '../images/searchlogo.png';

const SearchClg = ({ data }) => {

  const [search, setSearch] = useState('');
  const [filtered, getFiltered] = useState([]);

  const handleSearch = () => {
    const newData = data.filter(elem => {
      const clgName = elem.title.toLowerCase().replaceAll(' ', '').replaceAll('-', '').replaceAll(',', '').replaceAll('[', '').replaceAll(']', '').replaceAll('&', 'and').replaceAll("'s", "").replaceAll('.', '').replaceAll('(', '').replaceAll(')', '');

      const userData = search.toLowerCase().trimEnd().replaceAll(' ', '').replaceAll('-', '').replaceAll(',', '').replaceAll('[', '').replaceAll(']', '').replaceAll('&', 'and').replaceAll("'s", "").replaceAll('.', '').replaceAll('(', '').replaceAll(')', '');
      const status = clgName.includes(userData);
      return status === true;
    })
    getFiltered(newData);
  }

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line
  }, [search])

  return (
    <>
      <div className="search-main-container">
        <div className="search-box-container">
          <h1 className='search-box-heading'><span className='search-span'><span >S</span>earch <span>y</span>our <span>d</span>ream <span>C</span>ollege...</span></h1>
          <div className="search-box-img">
            <img src={searchImg} className="search-img" alt="search box img" />
          </div>
          <div className="search-input-box">
            <span className='input-span'><input type="text" placeholder='Search your dream college...' value={search} onChange={e => setSearch(e.target.value.trimStart())} /><i className="fa-solid fa-magnifying-glass" onClick={handleSearch}></i></span>
          </div>
        </div>
        {search ? <div className="search-result-content">
          {filtered.map((elem, indx) => <div className="search-content" key={indx}>
            <div className="college-img">
              <img src={elem.logo} alt="College imeges" />
            </div>
            <div className="college-data">
              <div className="college-name-container">
                <h1 className='college-name'><a href={elem.url} target="_blank" rel="noreferrer">{elem.title}</a></h1>
                <p className='college-location'>{elem.location}</p>
              </div>
              <div className="fee-structer">
                <h1>{elem.fee}</h1>
                <p className='course-in-fee'>{elem.course}</p>
                <p>{elem.rating}</p>
              </div>
            </div>
            <div className="redirect-college">
              <div className="redirect-btn-box">
                <a href={elem.url} target="_blank" rel="noreferrer"><button className='redirect-btn'>Apply Now</button></a><br />
                <br />
                <a href={elem.reviews} target="_blank" rel="noreferrer"><button className='redirect-btn' >Reviews</button></a>
              </div>
            </div>
          </div>
          )}
        </div> : <div></div>}
      </div>
    </>
  )
}

export default SearchClg;