import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import jwt_decode from 'jwt-decode';
import { message } from 'antd';

const PrivateRoute = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');

  useEffect(() => {
    if (token) {
      const decodedToken = jwt_decode(token);
      // console.log('decodedToken: ', decodedToken);
      if (decodedToken?.exp * 1000 < Date.now()) {
        // Token is expired, redirect to login
        message.error('Session expired!, Please login again');
        console.log('Token is expired');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        return;
      }
    }
    // console.log('Protected Route MiddleWare run!');
  }, [navigate]);

  return token ? <Outlet /> : <Navigate to='/login' replace />;
};

export default PrivateRoute;
