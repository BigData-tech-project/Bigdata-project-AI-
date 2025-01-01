import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import axios from 'axios';
import '../css/todaydust.css';
import cityMapping from '../region_mapping/cityMapping.js';
import cityCoordinates from '../region_mapping/cityPosition.js';

// 네비게이션 바 컴포넌트
const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/todayDust" className="navbar-logo">
          DustAI
        </Link>
        
        <div className="navbar-menu">
          <Link to="/analyze" className="navbar-link">
            AI 분석 페이지 이동
          </Link>
          <Link to="/dustdata" className="navbar-link">
            미세먼지 데이터
          </Link>
          <Link to="/login" className="navbar-login">
            로그인
          </Link>
        </div>
      </div>
    </nav>
  );
};

// API 키 설정
const API_KEY = 'pVHLUl3UGVDmm%2BB0aUxMttCQnoCePxtWLb4WJKushUW6XjTX93l89IkU%2FdELSR6nZ318fR3efuSBb3gVpjAFFA%3D%3D';

const TodayDust = () => {
  // 상태 관리
  const [dustData, setDustData] = useState(null);
  const [dbData, setDbData] = useState([]);
  const [apiData, setApiData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 미세먼지 데이터 가져오기
  const fetchDustData = async () => {
    try {
      const response = await fetch(
        `https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureLIst?itemCode=PM10&dataGubun=HOUR&pageNo=1&numOfRows=1&returnType=json&serviceKey=${API_KEY}`
      );
      const data = await response.json();
      return data.response.body.items[0];
    } catch (error) {
      console.error('미세먼지 데이터 가져오기 실패:', error);
      throw error;
    }
  };

  // DB 데이터 가져오기
  const fetchDbData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/products/');
      return response.data;
    } catch (error) {
      console.error('DB 데이터 가져오기 실패:', error);
      throw error;
    }
  };

  // 상세 데이터 가져오기
  const fetchDetailData = async (region, regionDetail) => {
    try {
      const response = await axios.get(
        `https://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst?sidoName=${region}&searchCondition=DAILY&pageNo=1&numOfRows=100&returnType=json&serviceKey=${API_KEY}`
      );

      const allItems = response.data.response.body.items;
      const matchingItems = allItems.filter(item => item.cityName === regionDetail);

      matchingItems.sort((a, b) => new Date(b.dataTime) - new Date(a.dataTime));

      return matchingItems.length > 0 ? [matchingItems[0]] : [];
    } catch (error) {
      console.error(`${region} 상세 데이터 가져오기 실패:`, error);
      return [];
    }
  };

  // 데이터 초기 로드
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [dustResult, dbResult] = await Promise.all([fetchDustData(), fetchDbData()]);

        setDustData(dustResult);
        setDbData(dbResult);

        if (dbResult.length > 0) {
          const { region, region_detail: regionDetail } = dbResult[0];
          const detailData = await fetchDetailData(region, regionDetail);

          setApiData([{ region, regionDetail, apiData: detailData }]);

          const diseaseInfo = dbResult.find(item => item.region === region);
          if (diseaseInfo) {
            setDustData(prevData => ({
              ...prevData,
              disease: diseaseInfo.disease,
              diseaseAdvice: diseaseInfo.diseaseAdvice,
            }));
          }
        }
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // 값에 따른 색상 가져오기
  const getColorByValue = (value, thresholds, colors) => {
    if (!value || value === '-') return colors[0];
    const numericValue = parseFloat(value);
    for (let i = 0; i < thresholds.length; i++) {
      if (numericValue <= thresholds[i]) return colors[i + 1];
    }
    return colors[colors.length - 1];
  };

  // 마커 스타일 가져오기
  const getMarkerStyle = (value) => {
    const thresholds = [30, 80, 150];
    const colors = ['rgba(128, 128, 128, 0.7)', 'rgba(76, 80, 175, 0.7)', 'rgba(76, 175, 80, 0.7)', 'rgba(255, 245, 89, 0.7)', 'rgba(244, 67, 54, 0.7)'];

    const backgroundColor = getColorByValue(value, thresholds, colors);
    const size = [30, 32.5, 35, 37.5][thresholds.findIndex(threshold => parseFloat(value) <= threshold) + 1] || 50;

    return {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor,
      borderRadius: '5px',
      border: '2px solid #333',
    };
  };

  // 로딩 및 에러 상태 처리
  if (loading) return <div className="loading">로딩중...</div>;
  if (error) return <div className="error">에러: {error}</div>;
  if (!dustData) return <div>데이터를 불러올 수 없습니다. 다시 시도해주세요.</div>;

  // 도시 데이터 필터링
  const cities = Object.entries(dustData).filter(
    ([key]) => key !== 'dataTime' && key !== 'dataGubun' && key !== 'itemCode'
  );

  // 컴포넌트 렌더링
  return (
    <>
      <Navbar />
      <div className="dust-container" style={{ marginTop: '64px' }}>

        {/* API 데이터 섹션 */}
        <div className="api-data-section">
          <ul className="api-data-list">
            {apiData.map((data) => (
              <li key={data.region} className="api-data-item">
                <h3>
                  <span className="region-name">{data.region}</span> 
                  <span className="region-detail"> {data.regionDetail}</span> 대기질 정보
                </h3>
                {data.apiData.length === 0 ? (
                  <p>해당 지역의 데이터가 없습니다.</p>
                ) : (
                  data.apiData.map((item, index) => (
                    <div key={index} className="measurement-info">
                      <div className="gauge-container">
                        {[
                          { value: item.pm10Value, label: 'PM10(미세먼지)', max: 150 },
                          { value: item.pm25Value, label: 'PM2.5(초미세먼지)', max: 150 },
                          { value: item.o3Value, label: 'O3(오존)', max: 1 }
                        ].map(({ value, label, max }) => (
                          <div key={label} className="gauge">
                            <CircularProgressbar
                              value={parseFloat(value) || 0}
                              maxValue={max}
                              text={value ? `${value}${label === 'O3(오존)' ? 'ppm' : '㎍/m³'}` : 'N/A'}
                              styles={buildStyles({
                                pathColor: getColorByValue(value, [15, 50, 100], ['rgba(128, 128, 128, 0.7)', 'rgba(76, 80, 175, 0.7)', 'rgba(76, 175, 80, 0.7)', 'rgba(244, 67, 54, 0.7)']),
                                textColor: '#333',
                              })}
                            />
                            <p>{label}</p>
                          </div> 
                        ))}
                      </div>
                      <ul>
                        <li>
                          <span style={{ backgroundColor: 'rgba(76, 80, 175, 0.7)' }}></span> : 좋음
                        </li>
                        <li>
                          <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.7)' }}></span> : 보통
                        </li>
                        <li>
                          <span style={{ backgroundColor: 'rgba(255, 245, 89, 0.7)' }}></span> : 나쁨
                        </li>
                        <li>
                          <span style={{ backgroundColor: 'rgba(244, 67, 54, 0.7)' }}></span> : 매우 나쁨
                        </li>
                      </ul>
                    </div>
                  ))
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* 질병 정보 박스 */}
        {dustData.disease && (
        <div className="disease-box">
          <h3 className="disease-title">
            <span className="disease-highlight">{dustData.disease}</span> 환자를 위한 미세먼지 대처 요령
          </h3>
          <div className="disease-content">
            <p className="dust-status">
              <span className="user-name">OOO</span> 님의 현재 지역 미세먼지 농도는{' '}
              <span 
                className="dust-value"
                style={{ 
                  color: (() => {
                    const value = apiData[0]?.apiData[0]?.pm10Value;
                    if (!value) return '#666';
                    const numValue = parseFloat(value);
                    if (numValue <= 30) return '#4C50AF';  // 좋음
                    if (numValue <= 80) return '#4CAF50';  // 보통
                    if (numValue <= 150) return '#FFF559'; // 나쁨
                    return '#F44336';                      // 매우 나쁨
                  })(),
                  fontWeight: 'bold'
                }}
              >
                {apiData[0]?.apiData[0]?.pm10Value ? 
                  `${apiData[0].apiData[0].pm10Value}㎍/m³` : 
                  '측정불가'
                }
              </span>
              {' '}으로,{' '}
              <span className="dust-level">
                {(() => {
                  const value = apiData[0]?.apiData[0]?.pm10Value;
                  if (!value) return '측정불가';
                  const numValue = parseFloat(value);
                  if (numValue <= 30) return '좋음';
                  if (numValue <= 80) return '보통';
                  if (numValue <= 150) return '나쁨';
                  return '매우 나쁨';
                })()}
              </span>
              {' '}수준입니다.
              </p>
            </div>
          </div>
        )}

        {/* 지도 컨테이너 */}
        <MapContainer
          
          center={[36.3, 128.5]}
          zoom={7}
          scrollWheelZoom={false}
          zoomControl={false}
          doubleClickZoom={false}
          className="map-container"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {cities.map(([city, value]) => {
            const coordinates = cityCoordinates[cityMapping[city]];
            if (!coordinates) return null;

            const markerStyle = getMarkerStyle(value);
            const icon = L.divIcon({
              className: 'custom-icon',
              html: `
                <div style="width:${markerStyle.width}; height:${markerStyle.height}; background-color:${markerStyle.backgroundColor}; border-radius:${markerStyle.borderRadius}; border:${markerStyle.border}; display: flex; justify-content: center; align-items: center;">
                  <span style="color: #000; font-weight: bold; font-size: 12px;">${cityMapping[city]}</span>
                </div>
              `,
            });
            return (
              <Marker key={city} position={coordinates} icon={icon}>
                <Popup>
                  <div style={{ textAlign: 'center', fontFamily: 'Roboto, sans-serif', color: '#333' }}>
                    <Link 
                      to="/dustdata" 
                      style={{ 
                        fontSize: '16px', 
                        color: '#007bff', 
                        textDecoration: 'none',
                        fontWeight: 'bold'
                      }}
                    >
                      {cityMapping[city]}
                    </Link> <br />
                    미세먼지(PM10): <span style={{ fontWeight: 'bold' }}>{value}㎍/m³</span> <br />
                    상태: 
                    <span style={{ fontWeight: 'bold' }}>
                      {parseFloat(value) <= 30 ? '좋음' :
                       parseFloat(value) <= 80 ? '보통' :
                       parseFloat(value) <= 150 ? '나쁨' : '매우 나쁨'}
                    </span>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* 범례 */}
        <ul>
          <li>
            <span style={{ backgroundColor: 'rgba(76, 80, 175, 0.7)' }}></span>(0~30) : 좋음
          </li>
          <li>
            <span style={{ backgroundColor: 'rgba(76, 175, 80, 0.7)' }}></span>(~80) : 보통
          </li>
          <li>
            <span style={{ backgroundColor: 'rgba(255, 245, 89, 0.7)' }}></span>(~150) : 나쁨
          </li>
          <li>
            <span style={{ backgroundColor: 'rgba(244, 67, 54, 0.7)' }}></span>(150+) : 매우 나쁨
          </li>
        </ul>
      </div>
      <footer className="footer">
        <div className="footer-container">
          <p>&copy; 2024 DustAI. All rights reserved.</p>
          <p>Privacy Policy | Terms of Service</p>
        </div>
      </footer>
    </>
  );
};

export default TodayDust;