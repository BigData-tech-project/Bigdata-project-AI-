import React from 'react';
import '../css/main.css'; // 스타일 파일 분리
import { Link } from 'react-router-dom';

const Main = () => {
    return (
        <div className="main-container">
            <header className="main-header">
                <h1>Dust-Health-AI</h1>
            </header>
            <main className="main-content">
                <p>실시간 미세먼지 데이터를 분석하여 사용자 건강에 미치는 영향을 예측하고, 예방 방법을 제공합니다.</p>
                <div className="button-group">
                    <Link to="/todaydust">
                        <button className="TodayDust-button">오늘의 미세먼지</button>
                    </Link>
                    <Link to="/dustdata">
                        <button className="DustData-button">미세먼지 정보</button>
                    </Link>
                    <Link to="/mypage">
                        <button className="Mypage-button">Mypage</button>
                    </Link>
                </div>
            </main>
        </div>
    );
};

export default Main;
