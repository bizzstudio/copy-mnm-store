// src/component/tomerTitle/tomerTitle.jsx
import React from 'react'
import tomerTitleBg from 'public/tomerTitleBg.png'

export default function tomerTitle({ title }) {
  return (
    <div className='w-48 h-48 bg-cover bg-center bg-no-repeat flex items-center justify-center' style={{ backgroundImage: `url(${tomerTitleBg.src})` }}>
        <h1 className='text-[50px] font-bold'>{title}</h1>
    </div>
  )
};