import React from 'react';
import { Link } from 'react-router-dom';
import '../css/dustdata.css'

const DustData = () => {
    return (
        <div className="today-container">
            <header className="today-header">
                <h1>DustData page</h1>
            </header>
            <main className="today-content">
                <p>요일별(시간별) 미세먼지 예측 페이지입니다.</p>
                <p>요일</p>
                <Link to="/analyze">2024년 12월 10일 미세먼지 농도</Link>
                <p>시간</p>
                <Link to="/analyze">2024년 12월 10일 오전 10시 미세먼지 농도</Link>
            </main>
            <Link to="/main">
                <button className="main-button">Main</button>
            </Link>
        </div>
    );
};

export default DustData;
