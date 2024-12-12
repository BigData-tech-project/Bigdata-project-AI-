import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import '../css/dustdata.css';
import { useNavigate } from 'react-router-dom';

const DustData = () => {
    const [city, setCity] = useState('');
    const [region, setRegion] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dustData, setDustData] = useState(null);
    const [cityAvgData, setCityAvgData] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');
    const [isRegionVisible, setIsRegionVisible] = useState(false);
    const [isDateVisible, setIsDateVisible] = useState(false);
    const navigate = useNavigate();

    // 도시 평균값 가져오기
    useEffect(() => {
        const fetchCityAvgData = async () => {
            try {
                const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst', {
                    params: {
                        serviceKey: 'pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA==',
                        returnType: 'json',
                        numOfRows: '1',
                        pageNo: '1',
                        sidoName: city,
                        searchCondition: 'DAILY'
                    }
                });

                if (response.data?.response?.body?.items?.length > 0) {
                    const item = response.data.response.body.items[0];
                    setCityAvgData({ pm10Value: item.pm10Value });
                } else {
                    setCityAvgData(null);
                }
            } catch (error) {
                console.error('Error fetching city average data:', error);
                setCityAvgData(null);
            }
        };

        if (city) {
            fetchCityAvgData();
        }
    }, [city]);

    // 지역별 데이터 가져오기
    useEffect(() => {
        const fetchDustData = async () => {
            if (city && region && startDate && endDate) {
                try {
                    const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getMsrstnAcctoRDyrg', {
                        params: {
                            serviceKey: 'pVHLUl3UGVDmm+B0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU/dELSR6nZ318fR3efuSBb3gVpjAFFA==',
                            returnType: 'json',
                            numOfRows: '100',
                            pageNo: '1',
                            inqBginDt: startDate.replace(/-/g, ''),
                            inqEndDt: endDate.replace(/-/g, ''),
                            msrstnName: region
                        }
                    });

                    if (response.data?.response?.body?.items?.length > 0) {
                        setDustData(response.data.response.body.items);
                        setErrorMessage('');
                    } else {
                        setDustData(null);
                        setErrorMessage('해당 날짜와 지역에 대한 데이터가 없습니다. 다른 날짜를 선택해 주세요.');
                    }
                } catch (error) {
                    console.error('Error fetching dust data:', error);
                    setDustData(null);
                    setErrorMessage('미세먼지 데이터를 불러오는 데 실패했습니다. 다시 시도해주세요.');
                }
            }
        };

        if (startDate && endDate) {
            fetchDustData();
        }
    }, [city, region, startDate, endDate]);

    const handleCityChange = (e) => {
        setCity(e.target.value);
        setRegion('');
        setStartDate('');
        setEndDate('');
        setIsRegionVisible(true);
        setIsDateVisible(false);
    };

    const handleRegionChange = (e) => {
        setRegion(e.target.value);
        setStartDate('');
        setEndDate('');
        setIsDateVisible(true);
    };

    const handleDateChange = () => {
        setDustData(null);
        setErrorMessage('');
    };

    const handleDateClick = (date) => {
        navigate(`/details/${date}`); // 클릭된 날짜로 이동
    };

    return (
        <div className="dustdata-container">
            <header className="dustdata-header">
                <h1>미세먼지 예측 페이지</h1>
            </header>
            <main className="dustdata-content">
                <p>아래에서 지역과 기간을 선택하여 해당 지역의 미세먼지 농도를 확인하세요.</p>

                <div className='dustdata-city-selector'>
                    <label htmlFor='city'>지역 선택</label>
                    <select id="city" value={city} onChange={handleCityChange}>
                        <option value="">지역 선택</option>
                        <option value="서울">서울</option>
                        <option value="부산">부산</option>
                        <option value="대구">대구</option>
                        <option value="인천">인천</option>
                        <option value="광주">광주</option>
                        <option value="대전">대전</option>
                        <option value="울산">울산</option>
                    </select>

                </div>

                {city && cityAvgData && (
                    <div className="dustdata-city-avg">
                        <h2>{city}의 평균 미세먼지 농도</h2>
                        <p>평균 미세먼지(PM10): {cityAvgData.pm10Value} µg/m³</p>
                    </div>
                )}

                {isRegionVisible && (
                    <div className="dustdata-region-selector">
                        <label htmlFor="region">구 선택: </label>
                        <select id="region" value={region} onChange={handleRegionChange}>
                            <option value="">구 선택</option>
                            <option value="강남구">강남구</option>
                            <option value="서초구">서초구</option>
                            <option value="송파구">송파구</option>
                            <option value="강동구">강동구</option>
                            <option value="용산구">용산구</option>
                            <option value="종로구">종로구</option>
                            <option value="사상구">사상구</option>
                        </select>
                    </div>
                )}

                {isDateVisible && (
                    <div className="dustdata-date-selector">
                        <label htmlFor="start-date">시작 날짜: </label>
                        <input
                            type="date"
                            id="start-date"
                            value={startDate}
                            onChange={(e) => {
                                setStartDate(e.target.value);
                                handleDateChange();
                            }}
                        />

                        <label htmlFor="end-date">종료 날짜: </label>
                        <input
                            type="date"
                            id="end-date"
                            value={endDate}
                            onChange={(e) => {
                                setEndDate(e.target.value);
                                handleDateChange();
                            }}
                        />
                    </div>
                )}

                <div className="dustdata-result">
                            {dustData && !errorMessage ? (
                                <>
                                    <h2>{region}의 {startDate}부터 {endDate}까지 미세먼지 데이터</h2>
                                    <ul>
                                        {dustData.map((item, index) => (
                                            <li
                                                key={index}
                                                onClick={() => handleDateClick(item.msurDt)}
                                                style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
                                            >
                                                {item.msurDt}: 미세먼지(PM10) - {item.pm10Value}µg/m³, 초미세먼지(PM2.5) - {item.pm25Value}µg/m³
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            ) : errorMessage ? (
                                <p className="error-message">{errorMessage}</p>
                            ) : dustData === null && startDate && endDate && region ? (
                                <p>데이터를 불러오는 중...</p>
                            ) : null}
                        </div>

            </main>
            <footer className="dustdata-footer">
                <Link to="/main">
                    <button className="main-button">Main</button>
                </Link>
            </footer>
        </div>
    );
};

export default DustData;
