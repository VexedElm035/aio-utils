import React from 'react'
import { Link } from 'react-router-dom'

const MainView = () => {
  return (
    <>
        <Link to='documents'>Documents</Link>
        <Link to='images'>Images</Link>
        <Link to='videos'>Videos</Link>
        <Link to='audios'>Audios</Link>
        
    </>
  )
}

export default MainView