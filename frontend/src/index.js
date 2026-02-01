import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home';
import Detail from './Detail';
import Login from './Login';
import Reg from './Reg';
import Profile from './Profile';

import List from './List';
import Order from './Order';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  
  <Router>
    <Routes>
        <Route path='/' element={<Home/>}/>
        <Route path='Home' element={<Home/>}/>
        <Route path='List' element={<List/>}/>
            <Route path='Detail' element={<Detail/>}/>
                <Route path='Login' element={<Login/>}/>
                    <Route path='Reg' element={<Reg/>}/>
                  <Route path='/profile' element={<Profile/>}/>
<Route path='/order' element={<Order/>}/>

    </Routes>



  </Router>
);

