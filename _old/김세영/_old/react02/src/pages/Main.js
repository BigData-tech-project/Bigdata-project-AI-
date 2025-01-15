import React from 'react'
import { Link } from 'react-router-dom'

function Main() {
  return (
    <>
    <nav>
        <Link to={'/'}>home</Link>{'    '}
        <Link to={'/analyze'}>analyze</Link>
    </nav>

    <h1>Main page</h1>

    </>
  )
}

export default Main