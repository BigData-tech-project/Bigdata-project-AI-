import React from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Main from './pages/Main';
import Login from './pages/Login'
import DustData from './pages/DustData';
import Mypage from './pages/Mypage';
import TodayDust from './pages/TodayDust'
import Analyze from './pages/Analyze'
import Home from './pages/Home'
import Detail from './pages/Detail';

const App =() => {
  return(
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path='/main' element={<Main />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dustdata" element={<DustData />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/todaydust" element={<TodayDust />} />
        <Route path="/analyze" element={<Analyze />} />
        <Route path="/details/:date" element={<Detail />} />
      </Routes>
    </Router>
  );
};
export default App;
