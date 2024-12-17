// Detail.js
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Detail = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 전달받은 데이터가 없으면 기본 값을 설정
    const dustData = location.state?.data || {
        pm10Value: 'N/A',
        pm25Value: 'N/A',
        msurDt: 'N/A',
    };

    return (
        <div className="detail-container">
            <h1>{dustData.msurDt} 미세먼지 상세 정보</h1>
            <p>미세먼지(PM10): {dustData.pm10Value} µg/m³</p>
            <p>초미세먼지(PM2.5): {dustData.pm25Value} µg/m³</p>
            <button onClick={() => navigate(-1)}>뒤로 가기</button>
        </div>
    );
};

export default Detail;
