import React from 'react';

const Signup2 = ({ data, ph, typ, name, val, inputData, validation }) => {
    return (
        <>
            <label className='sign-up-tags lable'>{data}</label>
            <input className='sign-up-tags input-sign' style={validation} placeholder={ph} type={typ} name={name} value={val} onChange={inputData} required />
        </>
    )
}

export default Signup2;