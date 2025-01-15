import React, { useState } from 'react';
import axios from 'axios';
//import '../css/userpastdata.css';

const UserPastData = () => {
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dustData, setDustData] = useState([]);
    const [errorMessage, setErrorMessage] = useState('');

    const cityRegionMap = {
        서울: [ '강남구', '강동구',   '강북구',
                '강서구', '관악구',   '광진구',
                '구로구', '금천구',   '노원구',
                '도봉구', '동대문구', '동작구',
                '마포구', '서대문구', '서초구',
                '성동구', '성북구',   '송파구',
                '양천구', '영등포구', '용산구',
                '은평구', '종로구',   '중구',
                '중랑구'
        ],
        부산: [ '강서구',   '금정구',
                '기장군',   '남구',
                '동구',     '동래구',
                '부산진구', '북구',
                '사상구',   '사하구',
                '서구',     '수영구',
                '연제구',   '영도구',
                '중구',     '해운대구'
        ],
        대구: [  '남구',   '달서구',
                '달성군', '동구',
                '북구',   '서구',
                '수성구', '중구',
                '군위군'
        ],
        인천: [ '강화군',   '계양구',
                '미추홀구', '남동구',
                '동구',     '부평구',
                '서구',     '연수구',
                '옹진군',   '중구'
        ],
        광주: [ '광산구', '남구', '동구', '북구', '서구'],
        대전: [ '대덕구', '동구', '서구', '유성구', '중구'],
        울산: [ '남구', '동구', '북구', '울주군', '중구' ],
        세종: [ '세종시'],
        경기: [  '가평군',   '고양시', '과천시',
                '광명시',   '광주시', '구리시',
                '군포시',   '김포시', '남양주시',
                '동두천시', '부천시', '성남시',
                '수원시',   '시흥시', '안산시',
                '안성시',   '안양시', '양주시',
                '양평군',   '여주시', '연천군',
                '오산시',   '용인시', '의왕시',
                '의정부시', '이천시', '파주시',
                '평택시',   '포천시', '하남시',
                '화성시'
        ],
        강원: [ '강릉시', '고성군', '동해시',
                '삼척시', '속초시', '양구군',
                '양양군', '영월군', '원주시',
                '인제군', '정선군', '철원군',
                '춘천시', '태백시', '평창군',
                '홍천군', '화천군', '횡성군'
        ],
        충북: [ '괴산군', '단양군',
                '보은군', '영동군',
                '옥천군', '음성군',
                '제천시', '진천군',
                '청주시', '충주시',
                '증평군'
        ],
        충남: [ '공주시', '금산군',
                '논산시', '당진시',
                '보령시', '부여군',
                '서산시', '서천군',
                '아산시', '예산군',
                '천안시', '청양군',
                '태안군', '홍성군',
                '계룡시'
        ],
        전북: [ '고창군', '군산시',
                '김제시', '남원시',
                '무주군', '부안군',
                '순창군', '완주군',
                '익산시', '임실군',
                '장수군', '전주시',
                '정읍시', '진안군'
        ],
        전남: [ '강진군', '고흥군', '곡성군',
                '광양시', '구례군', '나주시',
                '담양군', '목포시', '무안군',
                '보성군', '순천시', '신안군',
                '여수시', '영광군', '영암군',
                '완도군', '장성군', '장흥군',
                '진도군', '함평군', '해남군',
                '화순군'
        ],
        경북: [ '경산시', '경주시', '구미시',
                '김천시', '문경시', '봉화군',
                '상주시', '성주군', '안동시',
                '영덕군', '영양군', '영주시',
                '영천시', '예천군', '울릉군',
                '울진군', '의성군', '청도군',
                '청송군', '칠곡군', '포항시'
        ],
        경남: [ '거제시', '거창군', '고성군',
                '김해시', '남해군', '밀양시',
                '사천시', '산청군', '양산시',
                '의령군', '진주시', '창녕군',
                '창원시', '통영시', '하동군',
                '함안군', '함양군', '합천군'
        ],
        제주: [ '서귀포시', '제주시'],
    };

    const fetchUserPastData = async () => {
        if (!city || !region || !startDate || !endDate) {
            setErrorMessage('모든 필드를 입력해주세요.');
            return;
        }

        try {
            const response = await axios.get(
                'http://apis.data.go.kr/B552584/ArpltnStatsSvc/getMsrstnAcctoRDyrg',
                {
                    params: {
                        serviceKey: 'pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA==',
                        returnType: 'json',
                        numOfRows: 100,
                        pageNo: 1,
                        inqBginDt: startDate.replace(/-/g, ''),
                        inqEndDt: endDate.replace(/-/g, ''),
                        msrstnName: region,
                        dataGubun: 'HOUR',
                    },
                }
            );
            const data = response.data?.response?.body?.items || [];
            setDustData(data);
            setErrorMessage('');
        } catch (error) {
            console.error('데이터 조회 오류:', error);
            setErrorMessage('데이터를 불러오는데 실패했습니다.');
        }
    };

    return (
        <div className="dustdata-container">
            <h1>사용자 지정 과거 데이터 조회</h1>
            <div className="form-container">
                <label>시/도 선택:</label>
                <select value={city} onChange={(e) => setCity(e.target.value)}>
                    <option value="">선택</option>
                    {Object.keys(cityRegionMap).map((city) => (
                        <option key={city} value={city}>
                            {city}
                        </option>
                    ))}
                </select>

                <label>구/군 선택:</label>
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                    <option value="">선택</option>
                    {cityRegionMap[city]?.map((region) => (
                        <option key={region} value={region}>
                            {region}
                        </option>
                    ))}
                </select>

                <label>시작 날짜:</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />

                <label>종료 날짜:</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

                <button onClick={fetchUserPastData}>조회</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </div>

            {dustData.length > 0 && (
                <div className="dustdata-box-grid">
                    {/* 카드 레이아웃 */}
                    {dustData.length > 0 && (
                            <div>
                                <div className="dustdata-box-grid">
                                    {dustData.map((item, index) => (
                                        <div
                                            key={index}
                                            className="dustdata-card"
                                        >
                                            <div className="dustdata-info">
                                                <p className="dust-date">{item.msurDt}</p>
                                                <p className="dust-detail">미세먼지(PM10): {item.pm10Value} µg/m³</p>
                                            </div>
                                            <div className="dust-status">
                                                <p className="dust-status-emoji">
                                                    {item.pm10Value <= 30
                                                        ? "😊"
                                                        : item.pm10Value <= 80
                                                        ? "😐"
                                                        : item.pm10Value <= 150
                                                        ? "😷"
                                                        : "😡"}
                                                </p>
                                                <p className="dust-status-text">
                                                    {item.pm10Value <= 30
                                                        ? "좋음"
                                                        : item.pm10Value <= 80
                                                        ? "보통"
                                                        : item.pm10Value <= 150
                                                        ? "나쁨"
                                                        : "매우 나쁨"}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                </div>
            )}
        </div>
    );
};

export default UserPastData;
