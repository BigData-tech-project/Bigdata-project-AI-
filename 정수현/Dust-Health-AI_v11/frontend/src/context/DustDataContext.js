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

            

      fetchPastData();
      fetchTodayData();
    }
  }, [city, region]);

  return (
    <DustDataContext.Provider
      value={{
        pastdustData,
        todaydustData,
        futureForecast,
        city,
        region,
      }}
    >
      {children}
    </DustDataContext.Provider>
  );
};