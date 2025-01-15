import React from 'react';
import { Link } from 'react-router-dom';
import '../css/todaydust.css'

const Analyze = () => {
    return (
    <div className="dust-container">
        <header className="dust-header">
            <h1>Analyze page</h1>
        </header>
        <main className="dust-content">
            <p>미세먼지 농도에 따른 사용자 맞춤 대처 방식 분석</p>
            <p>미세먼지 농도가 높을 때 대처 방식</p>
            <p>미세먼지 농도가 낮을 때 대처 방식</p>
        </main>
        <Link to="/main">
            <button className="main-button">Main</button>
        </Link>

    </div>
);
};

export default Analyze;