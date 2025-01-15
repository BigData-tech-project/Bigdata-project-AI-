import React, { useContext } from 'react';
import { DustDataContext } from '../context/DustDataContext';
import { Line } from 'react-chartjs-2';

const DustData = () => {
  const { dustData, city, region } = useContext(DustDataContext);

  const chartData = {
    labels: dustData.map((item) => item.msurDt),
    datasets: [
      {
        label: 'PM10 농도',
        data: dustData.map((item) => item.pm10Value),
        borderColor: 'blue',
        backgroundColor: 'rgba(0, 0, 255, 0.3)',
      },
    ],
  };

  return (
    <div>
      <h1>{city} {region} 미세먼지 데이터</h1>
      {dustData.length > 0 ? (
        <Line data={chartData} />
      ) : (
        <p>데이터를 불러오는 중입니다...</p>
      )}
    </div>
  );
};

export default DustData;
