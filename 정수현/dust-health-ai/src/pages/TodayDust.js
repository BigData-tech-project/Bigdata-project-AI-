import React from 'react';
import { Link } from 'react-router-dom';
import '../css/todaydust.css';

const TodayDust = () => {
    return (
        <div className="dust-container">
            <header className="dust-header">
                <h1>TodayDust page</h1>
            </header>
            <main className="dust-content">
                <p>오늘의 미세먼지</p>
                <img src="https://cdn.sisunnews.co.kr/news/photo/202304/182753_343332_3133.png" alt="오늘의 날씨 아이콘" className="weather-icon" />
                <p>사용자 맞춤 분석</p>
                <Link to="/analyze">
                    <button className="AI-button">AI 분석 페이지 이동</button>
                </Link>
            </main>
            <Link to="/main">
                <button className="main-button">Main</button>
            </Link>
        </div>
    );
};

export default TodayDust;
