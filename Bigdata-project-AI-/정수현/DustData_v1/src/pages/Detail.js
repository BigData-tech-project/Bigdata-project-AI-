import React from 'react';
import { Link, useParams } from 'react-router-dom';

const Detail = () => {
    const { date } = useParams(); // URL에서 날짜 가져오기

    return (
        <div>
            <h1>{date}의 미세먼지 상세 정보</h1>
            {/* 상세 데이터 표시 */}

            <footer className="dustdata-footer">
                <Link to="/main">
                    <button className="main-button">Main</button>
                </Link>
            </footer>
        </div>
    );
};

export default Detail;
