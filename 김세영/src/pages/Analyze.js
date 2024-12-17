import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../css/todaydust.css'

function AirQualityAnalysis() {
    const [airQualityData, setAirQualityData] = useState({
        time: '',
        pmConcentration: 0,
        pmStatus: '',
        healthImpact: ''
    });

    const [userCondition, setUserCondition] = useState('');
    const [conditionImpact, setConditionImpact] = useState('');

    useEffect(() => {
        fetchAirQualityData();
    }, []);

    const fetchAirQualityData = () => {
        // 가상 데이터 예제
        const data = {
            time: new Date().toLocaleTimeString('ko-KR'),
            pmConcentration: 75, // µg/m³
            pmStatus: "나쁨",
            healthImpact: "민감군에게 건강 문제가 발생할 수 있으며, 일반인에게도 약간의 영향이 있을 수 있습니다."
        };
        setAirQualityData(data);
    };

    const analyzeConditionImpact = () => {
        let impact = '';
        if (userCondition.toLowerCase() === '폐렴') {
            if (airQualityData.pmConcentration > 50) {
                impact = "미세먼지 농도가 높아 폐렴 환자에게 증상 악화를 유발할 수 있습니다. 실내에 머무르며 예방 조치를 취하세요.";
            } else {
                impact = "현재 미세먼지 농도가 비교적 낮아 폐렴 환자에게 큰 영향을 미치지 않을 것으로 보입니다.";
            }
        } else if (userCondition) {
            impact = `현재 입력된 기저질환(${userCondition})에 대한 영향 분석이 준비되지 않았습니다.`;
        }
        setConditionImpact(impact);
    };

    return (
        <div className="container">
            <h1>미세먼지 건강 영향 분석</h1>

            {/* 현재 시간 및 미세먼지 농도 */}
            <div className="section">
                <label>현재 시간:</label>
                <div className="info-box">{airQualityData.time}</div>

                <label>미세먼지 농도 (µg/m³):</label>
                <div className="info-box">{airQualityData.pmConcentration}</div>
            </div>

            {/* 미세먼지 나쁨 정도 */}
            <div className="section">
                <label>미세먼지 상태:</label>
                <div className="info-box">{airQualityData.pmStatus}</div>
            </div>

            {/* 사용자 건강에 미치는 영향 */}
            <div className="section">
                <label>건강 영향:</label>
                <div className="info-box danger">{airQualityData.healthImpact}</div>
            </div>

            {/* 사용자 기저질환 입력 및 영향 분석 */}
            <div className="section">
                <label>기저질환 입력:</label>
                <input
                    type="text"
                    value={userCondition}
                    onChange={(e) => setUserCondition(e.target.value)}
                    placeholder="예: 폐렴"
                    className="info-box"
                />
                <button onClick={analyzeConditionImpact}>영향 분석</button>
                <div className="info-box danger">{conditionImpact}</div>
            </div>

            {/* 추가 정보 (권장 행동 및 예방 조치) */}
            <div className="section">
                <label>추천 행동:</label>
                <ul className="info-box">
                    <li>외출 시 마스크 착용</li>
                    <li>공기 청정기 사용</li>
                    <li>실내 공기 환기 최소화</li>
                    <li>충분한 수분 섭취</li>
                </ul>
            </div>

            <button onClick={fetchAirQualityData}>데이터 새로고침</button>
        </div>
    );
}

export default AirQualityAnalysis;
