import React, { useEffect, useState } from 'react'
import '../css/healthAI.css';
import '../css/footer.css';
import ArcProgress from "react-arc-progress";
import { Link } from 'react-router-dom';
import Avatar from "@mui/joy/Avatar";
import HomeIcon from '@mui/icons-material/Home';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety';

const progress = 0.782;
const size = "320";
const fillColor = {gradient: ["#75beeb","#c1b5e3"]};
const customText = [
{ text: "나쁨", size: "20px", color: "#242330", x:size/2, y: 350/3 }
];
const text="75µg/m";
const FDval=45;

const HealthTracker = () => {
        // AI response 가져오기기
        const [userData, setUserData] = useState(null);
        const [analy, setAnaly]=useState('test');
        useEffect(()=>{
            fetch('http://127.0.0.1:8000/analyze/complex/'+FDval,{
                method:'GET'
                }
            )
            .then(res=>res.json())
            .then(json=>{setAnaly(json);
                console.log(json)
            })
            .catch(err=>{
                console.log(err);})
        },[]);
        
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
  }
    
        const [airQualityData, setAirQualityData] = useState({
            time: '',
            pmConcentration: 0,
            pmStatus: '',
            healthImpact: ''
        });
    
        const [userCondition, setUserCondition] = useState('');
        const [conditionImpact, setConditionImpact] = useState('');
    
        useEffect(() => {
            fetchAirQualityData();
        }, []);
    
        const fetchAirQualityData = () => {
            // 가상 데이터 예제
            const data = {
                time: new Date().toLocaleTimeString('ko-KR'),
                pmConcentration: "25µg/m³", // µg/m³
                pmStatus: "보통"
            };
            setAirQualityData(data);
        };
    
        
    return (
        <div className="container gradient_background">
            {/* Header Section */}
            <header className="header">
                <Avatar/>
                <div className="header-icons">
                    <button className="icon-button">🔔</button>
                </div>
            </header>

        {/* 현재 시간 및 미세먼지 농도 */}
            <section className="progress-section">
                <div className="progress-card">
                    <div className="progress-date">{airQualityData.time}</div>
                        <div className="progress-circle">
                        <ArcProgress
                            progress={progress}
                            text={text}
                            size={size}
                            fillColor={fillColor}
                            fillThickness="30"
                            thickness="20"
                            customText={customText}
                            arcStart={180}
                            arcEnd={360}
                            observer={(current) => {
                            const { percentage, currentText } = current;
                            console.log("observer:", percentage, currentText);
                            }}
                            animationEnd={({ progress, text }) => {
                            console.log("animationEnd", progress, text);
                            }}
                        />
                        </div>
                </div>
            </section>

            {/* AI 분석결과 */}
            <section className="analyze-section">
                <div className="analyze-card analyze-gradient_background">
                {analy.response}
                </div>
            </section>

            {/* Footer Navigation */}
            <footer className="footer-nav">
                <Link to={'/'}><HomeIcon color="disabled" sx={{ fontSize: 30 }} className="nav-button"/></Link>
                <Link to={'/test'}><HealthAndSafetyIcon sx={{ fontSize: 30 }} className="nav-button"/></Link>
                <Link to={'/analyze'}><AccountCircleIcon color="disabled" sx={{ fontSize: 30 }} className="nav-button"/></Link>
            </footer>
        </div>
    );
};

export default HealthTracker;

