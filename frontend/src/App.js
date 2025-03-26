import logo from './logo.svg';
import './App.css';
import { Routes, Route } from "react-router-dom";
import Login from './components/Login.js';
import Register from './components/Register.js';
import Home from './components/Home.js';


function App() {
  return (
    <div className="App">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/home" element={<Home />}></Route>
          </Routes>
    </div>
  );
}

export default App;
