import React, { useState, useEffect} from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale } from 'chart.js';
import '../css/dustdata.css';

ChartJS.register(Title, Tooltip, Legend, LineElement, PointElement, CategoryScale, LinearScale);

const serviceKey = "zhvs5TlKznNkfpG91l4BPgIcZtbsxovufWhyA4+w2KcaA1dp6RsGVOYHyD91i/XzDfAqOFIdScVjvbElsw+BCQ==";

const DustData = () => {
    const [city, setCity] = useState("");
    const [region, setRegion] = useState("");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [dustData, setDustData] = useState([]);
    const [cityAvgData, setCityAvgData] = useState(null);
    const [todayDust, setTodayDust] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const fetchDbData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/app/info/', {
        withCredentials: true, // 쿠키를 포함한 요청을 보냅니다.
      });
      console.log('DB Response:', response.data);

      if (!response.data.region) {
        throw new Error('지역 정보가 없습니다.');
      }

      const [mainRegion, subRegion] = response.data.region.split(' ');
      setCity(mainRegion || '');
      setRegion(subRegion || '');
      return response.data;
    } catch (error) {
      console.error('DB 데이터 가져오기 실패:', error);
      setErrorMessage('데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

    useEffect(() => {
        fetchDbData();
    }, []);

    useEffect(() => {
        const now = new Date();
        const start = new Date();
        const end = new Date();
        start.setDate(now.getDate() - 7); // 일주일 전
        end.setDate(now.getDate()-1); // 하루 전
    
        const formatDate = (date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        };
    
        setStartDate(formatDate(start));
        setEndDate(formatDate(end));
    }, []);

     // 평균 미세먼지 값 가져오기
     useEffect(() => {
        const fetchCityAvgData = async () => {
            if (!city) return;
            try {
                const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst', {
                    params: {
                        serviceKey: serviceKey,
                        returnType: 'json',
                        numOfRows: '1',
                        pageNo: '1',
                        sidoName: city,
                        searchCondition: 'DAILY',
                    },
                });
                if (response.data?.response?.body?.items?.length > 0) {
                    const item = response.data.response.body.items[0];
                    setCityAvgData({ pm10Value: item.pm10Value });
                } else {
                    setCityAvgData(null);
                }
            } catch (error) {
                console.error('Error fetching city average data:', error);
            }
        };
        fetchCityAvgData();
    }, [city]);

    // 과거 데이터 조회
    const fetchPastData = async () => {
        if (!city || !region) {
            setErrorMessage('시/도와 구/군을 선택해주세요.');
            return;
        }
        try {
            const response = await axios.get(
                'http://apis.data.go.kr/B552584/ArpltnStatsSvc/getMsrstnAcctoRDyrg',
                {
                    params: {
                        serviceKey: serviceKey,
                        returnType: 'json',
                        numOfRows: 100,
                        pageNo: 1,
                        inqBginDt: startDate.replace(/-/g, ''), // 자동 설정된 시작 날짜
                        inqEndDt: endDate.replace(/-/g, ''),   // 자동 설정된 종료 날짜
                        msrstnName: region,                    // 측정소 이름
                        dataGubun: 'HOUR',                     // 시간 단위 데이터
                    },
                }
            );
    
            const data = response.data?.response?.body?.items || [];
            setDustData(data);
            setErrorMessage('');
        } catch (error) {
            console.error('API 호출 오류:', error);
            setErrorMessage('과거 데이터를 불러오는데 실패했습니다.');
        }
    };
    
    // 현재 데이터 조회
    const fetchTodayData = async () => {
        if (!city || !region) {
            setErrorMessage('시/도와 구/군을 선택해주세요.');
            return;
        }
    
        try {
            console.log(`Fetching today data for city: ${city}, region: ${region}`);
            const response = await axios.get(
                'http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst',
                {
                    params: {
                        serviceKey: serviceKey,
                        returnType: 'json',
                        numOfRows: 100,
                        pageNo: 1,
                        sidoName: city,
                        searchCondition: 'DAILY',
                    },
                }
            );
    
            console.log('API Response:', response.data);
    
            const items = response.data?.response?.body?.items || [];
            console.log('Items:', items);
    
            const regionData = items.find((item) => item.cityName.trim() === region.trim());
            console.log('Matched Region Data:', regionData);
    
            if (regionData) {
                setTodayDust(regionData);
                setErrorMessage('');
            } else {
                setErrorMessage('해당 지역의 데이터가 없습니다.');
            }
        } catch (error) {
            console.error('Error fetching today data:', error);
            setErrorMessage('현재 데이터를 불러오는데 실패했습니다.');
        }
    };
    
    
    // 현재 데이터를 자동으로 조회
    useEffect(() => {
        if (city && region) {
            fetchTodayData();
            fetchPastData();
        }
    }, [city, region]);

    const createEmojiCanvas = (emoji) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 20; // 캔버스 크기
        canvas.height = 20;
        ctx.font = '18px Arial'; // 폰트 크기
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(emoji, canvas.width / 2, canvas.height / 2); // 이모지를 캔버스 중앙에 그림
        return canvas;
    };
    
    const generateCustomPointStyles = (values) => {
        return values.map((value) => {
            if (value <= 30) return createEmojiCanvas('😊'); // 좋음
            else if (value <= 80) return createEmojiCanvas('😐'); // 보통
            else if (value <= 150) return createEmojiCanvas('😷'); // 나쁨
            else return createEmojiCanvas('😡'); // 매우 나쁨
        });
    };
    
    const pointStyles = generateCustomPointStyles(dustData.map((item) => item.pm10Value));
    
    const chartData = {
        labels: dustData.map((item) => item.msurDt), // 날짜 라벨
        datasets: [
            {
                label: 'PM10 농도 (µg/m³)',
                data: dustData.map((item) => item.pm10Value),
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                pointStyle: pointStyles, // 사용자 정의 이모지 스타일 적용
                pointBorderWidth: 2,
                pointRadius: 10, // 포인트 크기
            },
        ],
    };

    const chartOptions = {
        plugins: {
            tooltip: {
                callbacks: {
                    label: function (context) {
                        const value = context.raw; // Y축 값
                        return `PM10 농도: ${value} µg/m³`;
                    },
                },
            },
        },
        scales: {
            y: {
                beginAtZero: true, // Y축 시작을 0으로 설정
                min: 0, // Y축 최소값 설정
                max: 100, // Y축 최대값 설정
                title: {
                    display: true,
                },
            },
            x: {
                title: {
                    display: true,
                },
            },
        },
    };


    return (
        <div className="dustdata-container">
            <header>
                <h1>미세먼지 상세 정보</h1>
            </header>

            <div className='dustdata-grid'>
                {/* 현재 데이터 섹션션 */}
                <div className='current-section'>
                        <div className="section current-data-section">
                            <h2>현재 {city} {region} 미세먼지 농도</h2>
                            
                            {/* 평균 미세먼지 */}
                            {city && cityAvgData && (
                                <div className='dustdata-result'>
                                    <div className='avgdata-card'>
                                    <h2>{city}의 평균 미세먼지(PM10)</h2>
                                    <p>{cityAvgData.pm10Value} µg/m³</p>
                                    </div>
                                </div>
                            )}
                            {errorMessage && <p className="error-message">{errorMessage}</p>}
                            {todayDust && (
                                <div className="current-dust-info">
                                    <h3>현재 {region}의 미세먼지 상태</h3>
                                    <p>{new Date().toLocaleString()}</p>
                                    <p>미세먼지(PM10): {todayDust.pm10Value} µg/m³</p>

                                    {/* 배경색 및 표정 강조 */}
                                    <div
                                        style={{
                                            padding: "10px",
                                            marginTop: "10px",
                                            color: "black",
                                            textAlign: "center",
                                            backgroundColor:
                                                todayDust.pm10Value <= 30
                                                    ? "green"
                                                    : todayDust.pm10Value <= 80
                                                    ? "khaki"
                                                    : todayDust.pm10Value <= 150
                                                    ? "orangered"
                                                    : "red",
                                        }}
                                    >
                                        {todayDust.pm10Value <= 30 && (
                                            <>
                                                <p className='current-emoji'>😊</p>
                                                현재 공기가 매우 좋습니다! <br />
                                                외출 및 운동에 적합한 날입니다!
                                            </>
                                        )}
                                        {todayDust.pm10Value > 30 && todayDust.pm10Value <= 80 && (
                                            <>
                                                <p className='current-emoji'>😐</p>
                                                현재 공기가 보통입니다.<br />
                                                특별한 주의가 필요하지 않지만, 민감한 사람은 주위가 필요합니다!
                                            </>
                                        )}
                                        {todayDust.pm10Value > 80 && todayDust.pm10Value <= 150 && (
                                            <>
                                                <p className='current-emoji'>😷</p>
                                                현재 공기가 나쁨 상태입니다.<br />
                                                외출 자제 및 실외 활동을 줄이고, 특히 민감한 사람은 실내에세 대기하는 것이 좋습니다!
                                            </>
                                        )}
                                        {todayDust.pm10Value > 150 && (
                                            <>
                                                <p className='current-emoji'>😡</p>😡
                                                현재 공기가 매우 나쁨 상태입니다.<br />
                                                가급적 외출을 삼가고, 실내에서 활동하는 것이 바람직합니다!
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                </div>
                {/* 과거 데이터 */}
                <div className='section past-section'>
                    <div>
                        <h2>{city} {region} 과거 미세먼지 정보</h2>
                        {/* 조회 기간 텍스트 */}
                        <p>
                                조회기간: <strong>{startDate} ~ {endDate} (일주일 전)</strong>
                        </p>

                        {/* 카드 레이아웃 */}
                        {dustData.length === 0 ? (
                            <p>과거 일주일 데이터 없음</p>
                        ) : (
                            <Line data={chartData} options={chartOptions}></Line>
                        )}
                        <Link to="/userpastdata">
                            <button>사용자 지정 조회</button>
                        </Link>
                    </div>
                </div>
                <div className='section future-section'>
                        <div>
                            <h2>미래 미세먼지 예측 부분</h2>
                            <Link to="/predict">
                                <button>미래 미세먼지 예측</button>
                            </Link>
                        </div>
                </div>
                <div className='section analyze-section'>
                    <div>
                        <h2>사용자 대응 방법 section(세영 님)</h2>
                        <p>ooo님은 ooo 질환을 가지고 있으므로 ~</p>
                    </div>
                </div>
            <Link to="/main">
                <button>메인으로 돌아가기</button>
            </Link>
        </div>
        </div>
    );
};

export default DustData;