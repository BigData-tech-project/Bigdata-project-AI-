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
  const [hourlyDustData, setHourlyDustData] = useState([]); // 시간별 데이터 상태

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
      const startDate = new Date();
      const endDate = new Date();
      startDate.setDate(startDate.getDate() - 3);
      endDate.setDate(endDate.getDate() - 1);

      const formattedStart = startDate.toISOString().split('T')[0];
      const formattedEnd = endDate.toISOString().split('T')[0];

      const fetchPastData = async () => {
        try {
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getMsrstnAcctoRDyrg', {
            params: {
              serviceKey,
              returnType: 'json',
              numOfRows: 5,
              pageNo: 1,
              inqBginDt: formattedStart.replace(/-/g, ''),
              inqEndDt: formattedEnd.replace(/-/g, ''),
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
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnInforInqireSvc/getMinuDustFrcstDspth', {
            params: {
              //futureservicekey
              serviceKey: "zhvs5TlKznNkfpG91l4BPgIcZtbsxovufWhyA4+w2KcaA1dp6RsGVOYHyD91i/XzDfAqOFIdScVjvbElsw+BCQ==",
              returnType: 'json',
              searchDate: new Date().toISOString().split('T')[0],
              informCode: 'PM10',
            },
          });
          const forecast = response.data?.response?.body?.items?.find((item) => item.informGrade.includes(city));
          setFutureForecast(forecast || null);
        } catch (error) {
          console.error('미래 데이터를 가져오는데 실패했습니다:', error);
        }
      };

      const fetchHourlyData = async () => {
        try {
          const response = await axios.get('http://apis.data.go.kr/B552584/ArpltnStatsSvc/getCtprvnMesureSidoLIst', {
            params: {
              serviceKey,
              returnType: 'json',
              numOfRows: 24, // 24시간 데이터 요청
              pageNo: 1,
              sidoName: city,
              searchCondition: 'HOUR',
            },
          });
          console.log("API 응답 데이터:", response.data);
          const hourlyData = response.data?.response?.body?.items?.filter((item) => item.cityName.trim() === region.trim());
          setHourlyDustData(hourlyData || []);
        } catch (error) {
          console.error('시간별 데이터를 가져오는데 실패했습니다:', error);
          setHourlyDustData([]);
        }
      };
      

      fetchPastData();
      fetchTodayData();
      fetchFutureData();
      fetchHourlyData();
    }
  }, [city, region]);

  return (
    <DustDataContext.Provider value={{ pastdustData, todaydustData, futureForecast, hourlyDustData, city, region }}>
      {children}
    </DustDataContext.Provider>
  );
};