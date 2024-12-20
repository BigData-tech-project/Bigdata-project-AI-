import logo from './logo.svg';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Main from './pages/Main';
import Analyze from './pages/Analyze';

function App() {
  return (
    <BrowserRouter>
    <Routes>
      <Route path='/' element={<Main />}/>
      <Route path='/analyze' element={<Analyze />}/>
    </Routes>
    </BrowserRouter>
  );
}

export default App;
