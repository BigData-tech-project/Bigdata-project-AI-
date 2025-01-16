import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const DustDataContext = createContext();

export const DustDataProvider = ({ children }) => {
  const [pastdustData, setPastDustData] = useState([]);
  const [todaydustData, setTodayDustData] = useState(null);
  const [futureForecast, setFutureForecast] = useState(null);
  const [city, setCity] = useState('');
  const [region, setRegion] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [futurePrediction, setFuturePrediction] = useState([]);
  const [filteredPrediction, setFilteredPrediction] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const serviceKey = process.env.REACT_APP_DUST_SERVICE_KEY;

  const fetchDbData = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:8000/app/info/', { withCredentials: true });
      const [mainRegion, subRegion] = response.data.region?.split(' ') || [];
      setCity(mainRegion || '');
      setRegion(subRegion || '');
    } catch (error) {
      console.error('DB 데이터 가져오기 실패:', error);
      setErrorMessage('데이터를 가져오는 중 오류가 발생했습니다.');
    }
  };

  useEffect(() => {
    fetchDbData();
  }, []);

  const fetchFuturePrediction = async () => {
    setIsUpdating(true);
    try {
      const response = await axios.get('http://127.0.0.1:8000/dust/predict/',{
        params: {
          city : city,
          region : region
        },
      });
      const predictionData = response.data;
      console.log("예측 데이터ㅣ", response.data);

      if (predictionData[city] && predictionData[city][region]) {
        setFilteredPrediction(predictionData[city][region]);
      } else {
        console.warn('현재 지역에 대한 예측 데이터가 없습니다.');
        setFilteredPrediction(null);
      }
    } catch (error) {
      console.error('미래 데이터를 가져오는데 실패했습니다:', error);
      setFilteredPrediction(null);
    } finally {
      setIsUpdating(false);
    }
  };

  useEffect(() => {
    if (city && region) {
      fetchFuturePrediction(); // API 호출
    }
  }, [city, region]);
  

  useEffect(() => {
    if (city && region) {

      const fetchPastData = async () => {
        try {
          const startDate = new Date();
          const endDate = new Date();
          startDate.setDate(startDate.getDate() - 4); // 4일 전부터
          endDate.setDate(endDate.getDate() - 1); // 1일 전까지
      
          const formattedStart = startDate.toISOString().split('T')[0];
          const formattedEnd = endDate.toISOString().split('T')[0];
      
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getMsrstnAcctoRDyrg', {
            params: {
              serviceKey,
              returnType: 'json',
              numOfRows: 5,
              pageNo: 1,
              inqBginDt: formattedStart.replace(/-/g, ''), // 예: 20250114
              inqEndDt: formattedEnd.replace(/-/g, ''),   // 예: 20250116
              msrstnName: region,
              dataGubun: 'HOUR',
            },
          });
      
          setPastDustData(response.data?.response?.body?.items || []);
        } catch (error) {
          console.error('과거 데이터를 가져오는데 실패했습니다:', error);
        }
      };
      

      const fetchTodayData = async () => {
        try {
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst', {
            params: {
              serviceKey,
              returnType: 'json',
              numOfRows: 100,
              pageNo: 1,
              sidoName: city,
              searchCondition: 'HOUR',
            },
          });
          const regionData = response.data?.response?.body?.items?.find((item) => item.cityName.trim() === region.trim());
          setTodayDustData(regionData || null);
        } catch (error) {
          console.error('현재 데이터를 가져오는데 실패했습니다:', error);
        }
      };

      const fetchFutureData = async () => {
        try {
          const today = new Date();
          const formattedToday = today.toISOString().split('T')[0];
      
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustFrcstDspth', {
            params: {
              serviceKey,
              returnType: 'json',
              searchDate: formattedToday, // 오늘 날짜 기준
              informCode: 'PM10',
            },
          });
      
          const forecast = response.data?.response?.body?.items?.find(
            (item) => new Date(item.dataTime) >= today && item.informGrade.includes(city)
          );
      
          setFutureForecast(forecast || null);
        } catch (error) {
          console.error('미래 데이터를 가져오는데 실패했습니다:', error);
        }
      };
      

      fetchPastData();
      fetchTodayData();
      fetchFutureData();
      fetchFuturePrediction();
    }
  }, [city, region]);

  // 새로운 useEffect: 1시간마다 자동으로 fetchFuturePrediction 호출
  useEffect(() => {
    if (city && region) {
      const interval = setInterval(() => {
        fetchFuturePrediction();
      }, 3600000); // 1시간마다 실행

      return () => clearInterval(interval); // 컴포넌트 언마운트 시 clearInterval 호출
    }
  }, [city, region]);

  return (
    <DustDataContext.Provider
      value={{
        pastdustData,
        todaydustData,
        futureForecast,
        futurePrediction,
        filteredPrediction,
        city,
        region,
      }}
    >
      {children}
    </DustDataContext.Provider>
  );
};
