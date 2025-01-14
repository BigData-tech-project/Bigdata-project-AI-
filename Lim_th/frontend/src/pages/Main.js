import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/main.css';
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PieChart } from '@mui/x-charts/PieChart';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import axios from 'axios';

const API_KEY = process.env.REACT_APP_API_KEY;

// 대기질 기준별 색상 및 임계값 설정
const airQualityStandards = {
  PM10: {
    thresholds: [30, 80, 150],  // 좋음(~30), 보통(~80), 나쁨(~150), 매우나쁨(150+)
    colors: ['#gray', '#4C50AF', '#4CAF50', '#FFF559', '#F44336']
  },
  PM25: {
    thresholds: [15, 35, 75],   // 좋음(~15), 보통(~35), 나쁨(~75), 매우나쁨(75+)
    colors: ['#gray', '#4C50AF', '#4CAF50', '#FFF559', '#F44336']
  },
  O3: {
    thresholds: [0.03, 0.09, 0.15],  // 좋음(~0.03), 보통(~0.09), 나쁨(~0.15), 매우나쁨(0.15+)
    colors: ['#gray', '#4C50AF', '#4CAF50', '#FFF559', '#F44336']
  }
};

// 값에 따른 색상 가져오기
const getColorByPollutant = (value, pollutantType) => {
  if (!value || value === '-') return airQualityStandards[pollutantType].colors[0];
  
  const numericValue = parseFloat(value);
  const { thresholds, colors } = airQualityStandards[pollutantType];
  
  for (let i = 0; i < thresholds.length; i++) {
    if (numericValue <= thresholds[i]) return colors[i + 1];
  }
  return colors[colors.length - 1];
};

// 대기질 상태 텍스트 반환
const getAirQualityStatus = (value, pollutantType) => {
  if (!value || value === '-') return '정보 없음';
  
  const numericValue = parseFloat(value);
  const { thresholds } = airQualityStandards[pollutantType];
  
  if (numericValue <= thresholds[0]) return '좋음';
  if (numericValue <= thresholds[1]) return '보통';
  if (numericValue <= thresholds[2]) return '나쁨';
  return '매우 나쁨';
};

function Main({setIsAuthenticated}) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [dustData, setDustData] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [error, setError] = useState(null);
  const [dbData, setDbData] = useState(null);
  const [analy, setAnaly] = useState('');

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }

  const fetchDustData = async () => {
    try {
      const response = await fetch(
        `https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureLIst?itemCode=PM10&dataGubun=HOUR&pageNo=1&numOfRows=1&returnType=json&serviceKey=${API_KEY}`
      );
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data = await response.json();
      return data.response.body.items[0];
    } catch (error) {
      console.error('미세먼지 데이터 가져오기 실패:', error);
      throw error;
    }
  };

  const fetchDbData = async (userId) => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/app/info/', {
        withCredentials: true
      });
      

  
      if (!response.data.region || !response.data.disease) {
        throw new Error('필요한 데이터가 없습니다.');
      }
      return response.data;
    } catch (error) {
      console.error('DB 데이터 가져오기 실패:', error);
      throw error;
    }
  };
  
  const fetchDetailData = async (fullRegion) => {
    try {
      const [mainRegion, subRegion] = fullRegion.split(' ');
      
      const response = await axios.get(
        `https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst?sidoName=${mainRegion}&searchCondition=DAILY&pageNo=1&numOfRows=100&returnType=json&serviceKey=${API_KEY}`
      );
  
      const allItems = response.data.response.body.items;
      const filteredItems = allItems.filter(item => item.cityName === subRegion)
        .sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime));
      
      return filteredItems;
    } catch (error) {
      console.error(`${fullRegion} 상세 데이터 가져오기 실패:`, error);
      return [];
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem("user_id");
    const storedUserName = localStorage.getItem("user_name") || '';

    setUserName(storedUserName);

    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [dustResult, userDbData] = await Promise.all([
          fetchDustData(),
          fetchDbData(userId)
        ]);
    
        setDustData(dustResult);
        setDbData(userDbData);

        if (userDbData && userDbData.region) {
          const detailData = await fetchDetailData(userDbData.region);
          setApiData([{ 
            region: userDbData.region, 
            apiData: detailData 
          }]);
    
          setDustData(prevData => ({
            ...prevData,
            disease: userDbData.disease,
          }));
        
          fetch('http://127.0.0.1:8000/analyze/compact/'+detailData[0].pm10Value+'&'+userDbData.disease, {
            method: 'GET'
          })
          .then(res => res.json())
          .then(json => {
            setAnaly(json);
          })
          .catch(err => {
            console.log(err);
          });
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchAllData();
    }
  }, []);

  useEffect(() => {

    // console.log('dbData 업데이트:', dbData);
    const checkAuth = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-auth/`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
          },
          credentials: "include",
        });
        setIsAuthenticated(response.ok);
        if (!response.ok) {
          localStorage.clear();
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) return <div className="loading">로딩중...</div>;
  if (error) return <div className="error">에러: {error}</div>;

  const currentData = apiData[0]?.apiData[0];
  const pm10Status = getAirQualityStatus(currentData?.pm10Value, 'PM10');
  const pm25Status = getAirQualityStatus(currentData?.pm25Value, 'PM25');
  const O3Status = getAirQualityStatus(currentData?.o3Value, 'O3');

  return (
    <div className="app-container">
      <header className="header">
        <p className="menu-button" onClick={toggleSidebar}>
          <MenuIcon sx={{ fontSize: 25 }} className="header-button" />
        </p>
        <div className="location">
          {dbData && dbData.region ? dbData.region : "위치 정보 없음"}
        </div>
        <Link to={'/map'}>
          <LocationOnIcon sx={{ fontSize: 25 }} className="header-button" />
        </Link>
      </header>

      {sidebarOpen && (
        <aside className="sidebar">
          <p className="menu-button" onClick={toggleSidebar}>
            <MenuIcon sx={{ fontSize: 25 }} className="header-button" />
          </p>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/mypage">마이페이지</Link></li>
            <li>
              <Link 
                onClick={async () => {
                  const logoutResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/logout/`, {
                    method: "POST",
                    headers: {
                      'Content-Type': 'application/json',
                      'X-CSRFToken': getCookie('csrftoken'),
                    },
                    credentials: "include",
                  });
                  setIsAuthenticated(false);
                  const data = await logoutResponse.json();
                  document.cookie = `csrftoken=${data.data.csrftoken}; path=/;`;
                  localStorage.clear();
                }}
              >
                로그아웃
              </Link>
            </li>
          </ul>
        </aside>
      )}

      <div className="main-container">
        <h1 className="title">내 위치 미세먼지 현황</h1>
        <p className="date">
          {new Date().toLocaleDateString('ko-KR', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric', 
            weekday: 'long' 
          })}
        </p>

        <Stack direction="row" width="100%" textAlign="center" spacing={2}>
          <section className="air-status">
            <Box flexGrow={1}>
              <div className="status-box">
                <CircularProgressbar
                  value={parseFloat(currentData?.pm10Value) || 0}
                  maxValue={200}
                  text={`${currentData?.pm10Value || 'N/A'}㎍/m³`}
                  styles={buildStyles({
                    pathColor: getColorByPollutant(currentData?.pm10Value, 'PM10'),
                    textColor: '#333',
                    trailColor: '#d6d6d6',
                  })}
                />
                <p className='pmText'>미세먼지</p>
                <hr />
                <div className="emoji">
                  {pm10Status === '좋음' || pm10Status === '보통' ? 
                    <SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /> :
                    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 25, color: "#7f99b8" }} />
                  }
                </div>
                <hr />
                <p className='pmStatus'>{pm10Status}</p>
              </div>
            </Box>
            <Box flexGrow={1}>
              <div className="status-box">
                <CircularProgressbar
                  value={parseFloat(currentData?.pm25Value) || 0}
                  maxValue={100}
                  text={`${currentData?.pm25Value || 'N/A'}㎍/m³`}
                  styles={buildStyles({
                    pathColor: getColorByPollutant(currentData?.pm25Value, 'PM25'),
                    textColor: '#333',
                    trailColor: '#d6d6d6',
                  })}
                />
                <p className='pmText'>초미세먼지</p>
                <hr />
                <div className="emoji">
                  {pm25Status === '좋음' || pm25Status === '보통' ? 
                    <SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /> :
                    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 25, color: "#7f99b8" }} />
                  }
                </div>
                <hr />
                <p className='pmStatus'>{pm25Status}</p>
              </div>
            </Box>
            <Box flexGrow={1}>
              <div className="status-box">
                <CircularProgressbar
                  value={parseFloat(currentData?.o3Value) || 0}
                  maxValue={100}
                  text={`${currentData?.o3Value || 'N/A'}`}
                  styles={buildStyles({
                    pathColor: getColorByPollutant(currentData?.o3Value, 'O3'),
                    textColor: '#333',
                    trailColor: '#d6d6d6',
                  })}
                />
                <p className='pmText'>오존</p>
                <hr />
                <div className="emoji">
                  {O3Status === '좋음' || O3Status === '보통' ? 
                    <SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /> :
                    <SentimentVeryDissatisfiedIcon sx={{ fontSize: 25, color: "#7f99b8" }} />
                  }
                </div>
                <hr />
                <p className='pmStatus'>{O3Status}</p>
              </div>
            </Box>
          </section>

          {/* <section className="chart">
            <Box flexGrow={1}>
              <PieChart
                margin={{ top: 0, bottom: 30, left: 10, right: 10 }}
                series={[
                  {
                    data: [
                      { id: 0, value: 10, color: '#829ed3', label: '(0-15) 좋음' },
                      { id: 1, value: 15, color: '#74cca9', label: '(16-35) 보통' },
                      { id: 2, value: 20, color: '#ecd685', label: '(36-75) 나쁨' },
                      { id: 3, value: 25, color: '#d98d8d', label: '(76↑) 매우 나쁨' },
                    ],
                    innerRadius: 50,
                  },
                ]}
                width={150}
                height={300}
                slotProps={{
                  legend: {
                    itemMarkWidth: 20,
                    itemMarkHeight: 10,
                    fontSize: 15,
                    direction: 'column',
                    position: { vertical: 'bottom', horizontal: 'left' },
                    padding: 0,
                    markGap: 15,
                    itemGap: 5,
                  },
                }}
              />
            </Box>
          </section> */}

          {/* <div className="weekly-status" style={{ color: '#ecd685' }}>
            이번 주 나쁨 46%
          </div> */}
        </Stack>

        {/* <ul className="legend">
          <li><span style={{ backgroundColor: '#4C50AF' }}></span> 좋음</li>
          <li><span style={{ backgroundColor: '#4CAF50' }}></span> 보통</li>
          <li><span style={{ backgroundColor: '#FFF559' }}></span> 나쁨</li>
          <li><span style={{ backgroundColor: '#F44336' }}></span> 매우 나쁨</li>
        </ul> */}

        <section className="guidance">
          <h3 className='guidance-title'>내 행동 요령</h3>
          <p className='guidance-p'>{analy || '대기질 분석 정보를 불러오는 중입니다...'}</p>
        </section>

        <section className="hourly-forecast">
          <h3>시간별 예보</h3>
          <div className="forecast-scroll" onMouseDown={(e) => {
            e.preventDefault();
            const container = e.currentTarget;
            let startX = e.pageX - container.offsetLeft;
            let scrollLeft = container.scrollLeft;

            const onMouseMove = (ev) => {
              const x = ev.pageX - container.offsetLeft;
              const walk = (x - startX) * 2; // Adjust scrolling speed
              container.scrollLeft = scrollLeft - walk;
            };

            const onMouseUp = () => {
              window.removeEventListener('mousemove', onMouseMove);
              window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
          }}>
            <div className="forecast-box">
              <p className='pmText'>오전 10시</p>
              <hr />
              <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
              <hr />
              <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
              <p className='pmText'>오전 11시</p>
              <hr />
              <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
              <hr />
              <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
              <p className='pmText'>오전 12시</p>
              <hr />
              <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
              <hr />
              <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
              <p className='pmText'>오후 1시</p>
              <hr />
              <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
              <hr />
              <p className='pmStatus'>좋음</p>
            </div>
          </div>
        </section>

        {/* 일일 예보 */}
        <section className="hourly-forecast">
        <h3>일일 예보</h3>

        <div className="forecast-scroll" onMouseDown={(e) => {
            e.preventDefault();
            const container = e.currentTarget;
            let startX = e.pageX - container.offsetLeft;
            let scrollLeft = container.scrollLeft;

            const onMouseMove = (ev) => {
            const x = ev.pageX - container.offsetLeft;
            const walk = (x - startX) * 2; // Adjust scrolling speed
            container.scrollLeft = scrollLeft - walk;
            };

            const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            };

            window.addEventListener('mousemove', onMouseMove);
            window.addEventListener('mouseup', onMouseUp);
        }}>
            <div className="forecast-box">
            <p className='pmText'>1/20(월)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/21(화)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/22(수)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/23(목)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/24(금)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/25(토)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
            <div className="forecast-box">
            <p className='pmText'>1/26(일)</p>
            <hr />
            <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
            <hr />
            <p className='pmStatus'>좋음</p>
            </div>
        </div>
        </section>


      </div>
    </div>
  );
};

export default Main;
