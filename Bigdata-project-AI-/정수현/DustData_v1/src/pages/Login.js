import React from 'react';
import { Link } from 'react-router-dom';
import '../css/login.css'

const Login = () => {
    return (
        <div className="login-container">
            <header className="login-header">
                <h1>Login page</h1>
            </header>
            <main className="login-content">
                <p>Login 페이지입니다.</p>
            </main>
            <Link to="/main">
                <button className="main-button">Main</button>
            </Link>
        </div>
    );
};


export default Login;
