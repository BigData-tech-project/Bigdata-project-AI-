import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/mypage.css';
import axios from 'axios'; // axios 추가

const Mypage = () => {
    const [formData, setFormData] = useState({
        bloodPressure: '',
        heartRate: '',
        outdoorHours: '',
        mask: '',
        asthma: false,
        allergies: false,
        respiratorySymptoms: '', // 추가: 호흡기 증상
        smokeHistory: false,    // 추가: 흡연 여부
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // 입력된 데이터를 저장하거나 서버로 전송하는 로직 추가
        console.log('Submitted Data:', formData);
        alert('건강 데이터가 저장되었습니다.');
    };

    return (
        <div className="mypage-container">
            <header className="mypage-header">
                <h1>Mypage</h1>
            </header>
            <main className="mypage-content">
                <h2>건강 데이터 입력</h2>
                <form className="health-data-form" onSubmit={handleSubmit}>
                    <label>
                        혈압 (수축기/이완기):
                        <input
                            type="text"
                            name="bloodPressure"
                            placeholder="예: 120/80"
                            value={formData.bloodPressure}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        심박수 (bpm):
                        <input
                            type="number"
                            name="heartRate"
                            placeholder="예: 70"
                            value={formData.heartRate}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        야외 활동 시간(평균):
                        <input
                            type="number"
                            name="outdoorHours"
                            placeholder="시간 단위 입력"
                            value={formData.outdoorHours}
                            onChange={handleChange}
                            required
                        />
                    </label>
                    <label>
                        마스크 착용 여부:
                        <select
                            name="mask"
                            value={formData.mask}
                            onChange={handleChange}
                            required
                        >
                            <option value="">선택</option>
                            <option value="always">항상 착용</option>
                            <option value="sometimes">때때로 착용</option>
                            <option value="never">착용 안 함</option>
                        </select>
                    </label>
                    <label>
                        천식 여부:
                        <input
                            type="checkbox"
                            name="asthma"
                            checked={formData.asthma}
                            onChange={handleChange}
                        />{' '}
                        예
                    </label>
                    <label>
                        알레르기 여부:
                        <input
                            type="checkbox"
                            name="allergies"
                            checked={formData.allergies}
                            onChange={handleChange}
                        />{' '}
                        예
                    </label>
                    <label>
                        호흡기 증상 (기침, 가래 등):
                        <input
                            type="text"
                            name="respiratorySymptoms"
                            placeholder="예: 기침, 가래, 숨 가쁨"
                            value={formData.respiratorySymptoms}
                            onChange={handleChange}
                        />
                    </label>
                    <label>
                        흡연 여부:
                        <input
                            type="checkbox"
                            name="smokeHistory"
                            checked={formData.smokeHistory}
                            onChange={handleChange}
                        />{' '}
                        예
                    </label>
                    <button type="submit" className="save-button">
                        저장
                    </button>
                </form>

                <h2>이전 이력</h2>
                <p>이전에 입력한 데이터는 여기에 표시됩니다.</p>

            </main>
            <Link to="/main">
                <button className="main-button">Main</button>
            </Link>
        </div>
    );
};

export default Mypage;
