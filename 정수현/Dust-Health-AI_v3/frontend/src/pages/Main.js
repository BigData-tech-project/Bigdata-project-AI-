import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/main.css';
import MenuIcon from '@mui/icons-material/Menu';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { PieChart } from '@mui/x-charts/PieChart';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import axios from 'axios';

const Main = () => {
  const location = useLocation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [city, setCity] = useState("");
  const [region, setRegion] = useState("");  
  const [userData,setUserData] = useState('');
  const { dustData = [], todayDust =[]} = location.state || {};
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  
  const fetchDbData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/app/info/', {
        withCredentials: true, // 쿠키를 포함한 요청을 보냅니다.
      });
    //   console.log('DB Response:', response.data);
      setUserData(response.data.disease);

      if (!response.data.region) {
        throw new Error('지역 정보가 없습니다.');
      }

      const [mainRegion, subRegion] = response.data.region.split(' ');
      setCity(mainRegion || '');
      setRegion(subRegion || '');
      return response.data;
    } catch (error) {
      console.error('DB 데이터 가져오기 실패:', error);
    }
  };

  useEffect(() => {
          fetchDbData();
      }, []);

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  }
    // 로그인 상태 확인
    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_API_URL}/api/check-auth/`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'X-CSRFToken': getCookie('csrftoken'),
            },
            credentials: "include", // 세션 쿠키를 자동으로 포함
          });
          if (response.ok) {
            setIsAuthenticated(true);
          } else {
            setIsAuthenticated(false);
            localStorage.clear();
          }
        } catch (error) {
          console.error("Error checking authentication:", error);
          setIsAuthenticated(false);
        }
      };
  
      checkAuth();
    }, []);

  const getEmoji = (pm10Value) => {
    if (pm10Value <= 30) return '😊';
    if (pm10Value <= 80) return '😐';
    if (pm10Value <= 150) return '😷';
    return '😡';
  };

  return (
    <div className="app-container">
      {/* HEADER */}
      <header className="header">
        <p className="menu-button" onClick={toggleSidebar}><MenuIcon sx={{ fontSize: 25 }} className="header-button" /></p>
        <div className="location">{city} {region}</div>
        <Link to={'/map'}><LocationOnIcon sx={{ fontSize: 25 }} className="header-button" /></Link>
      </header>

      {sidebarOpen && (
        <aside className="sidebar">
          <p className="menu-button" onClick={toggleSidebar}><MenuIcon sx={{ fontSize: 25 }} className="header-button" /></p>
          <ul>
            <li><Link to="/">홈</Link></li>
            <li><Link to="/mypage">마이페이지</Link></li>
            <li><Link to="/dustdata">상세페이지</Link></li>
            <li><Link 
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
                로그아웃</Link></li>
          </ul>
        </aside>
      )}

      <div className="main-container">
        <h1 className="title">내 위치 미세먼지 현황</h1>
        <p className="date">{new Date().toLocaleDateString()}</p>

        <Stack direction="row" width="100%" textAlign="center" spacing={2}>
          {/* 미세먼지 초미세먼지 */}
          <section className="air-status">
            <Box flexGrow={1}>
              <div className="status-box">
                <p className='pmVal'>12㎍/㎥(24h)</p>
                <p className='pmText'>미세먼지</p>
                <hr />
                <div className="emoji"><SentimentVeryDissatisfiedIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
                <hr />
                <p className='pmStatus'>좋음</p>
              </div>
            </Box>
            <Box flexGrow={1}>
              <div className="status-box">
                <p className='pmVal'>12㎍/㎥(24h)</p>
                <p className='pmText'>초 미세먼지</p>
                <hr />
                <div className="emoji"><SentimentSatisfiedAltIcon sx={{ fontSize: 25, color: "#7f99b8" }} /></div>
                <hr />
                <p className='pmStatus'>좋음</p>
              </div>
            </Box>
          </section>

          {/* PIE CHART */}
          <section className="chart">
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
          </section>

          <div className="weekly-status" style={{ color: '#ecd685' }}>이번 주 나쁨 46%</div>
        </Stack>

        {/* 내 행동 요령 */}
        <section className="guidance">
          <h3 className='guidance-title'>내 행동 요령</h3>
          <p className='guidance-p'>실외활동 시 특별히 행동에 제한 받을 필요 없지만 '민감군'의 경우 특별히 개인별 건강상태에 따라 유의하며 화동해야 함</p>
        </section>

        {/* 시간별 예보 */}
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

          <div className="forecast-scroll" ref={(el) => {
              if (el) {
              // 현재 데이터를 중앙에 보이게 스크롤 설정
              const currentElement = el.querySelector(".current-data-box");
              if (currentElement) {
                currentElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                  });
                }
              }
            }}
            onMouseDown={(e) => {
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
              window.removeEventListener("mousemove", onMouseMove);
              window.removeEventListener("mouseup", onMouseUp);
            };

            window.addEventListener("mousemove", onMouseMove);
            window.addEventListener("mouseup", onMouseUp);
          }}
          >
        
        {/* 과거 데이터 렌더링 */}
        {dustData.length > 0 ? (
          dustData.map((item, index) => {
            const dataTime = item?.msurDt || '날짜 없음';
            const pm10Value = item?.pm10Value || '데이터 없음';

            return (
              <div key={index} className="forecast-box"
              onClick={(e) => {
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }}
              >
                <p className="pmText">{dataTime.split(' ')[0]}</p>
                <hr />
                <div className="emoji">{getEmoji(pm10Value)}</div>
                <hr />
                <p className="pmStatus">{pm10Value} µg/m³</p>
              </div>
            );
          })
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}

        {/* 현재 데이터 렌더링 */}
        {todayDust && (
          <div className="forecast-box current-data-box"
          onClick={(e) => {
            e.currentTarget.scrollIntoView({
              behavior: "smooth",
              block: "center",
              inline: "center",
            });
          }}
          >
            <p className="pmText">현재</p>
            <hr />
            <div className="emoji">{getEmoji(todayDust.pm10Value)}</div>
            <hr />
            <p className="pmStatus">{todayDust.pm10Value} µg/m³</p>
          </div>
        )}

        {dustData.length > 0 ? (
          dustData.map((item, index) => {
            const dataTime = item?.msurDt || '날짜 없음';
            const pm10Value = item?.pm10Value || '데이터 없음';

            return (
              <div key={index} className="forecast-box"
              onClick={(e) => {
                e.currentTarget.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                  inline: "center",
                });
              }}
              >
                <p className="pmText">{dataTime.split(' ')[0]}</p>
                <hr />
                <div className="emoji">{getEmoji(pm10Value)}</div>
                <hr />
                <p className="pmStatus">{pm10Value} µg/m³</p>
              </div>
            );
          })
        ) : (
          <p>데이터를 불러오는 중입니다...</p>
        )}
      </div>
    </section>


      </div>
    </div>
  );
};

export default Main;