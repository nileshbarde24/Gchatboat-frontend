import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

import FileUpload from './components/FileUpload';
import SiteLayout from './components/SiteLayout';
import Users from './components/Users';
import Chat from './pages/Chat';
import Files from './pages/Files';
import PrivateRoute from './utils/PrivateRoute';
import { Spin } from 'antd';
import SelectUserRole from './components/SelectUserRole';
import EmailVerifyFailPage from './components/EmailVerifyFailPage';
import UserProfile from './pages/UserProfile';
import ForgotPassword from './pages/ForgotPassword';
import DocChat from './pages/DocChat';
import ResetPassword from './pages/ResetPassword';
import TwoFactorAuth from './components/TwoFactorAuth';
import SelectedFileChat from './pages/SelectedFileChat';
import ChatOnImage from './pages/ChatOnImage';
import AllOverChat from './pages/AllOverChat';
import ConnectionList from './pages/ConnectionList';
import SQLChat from './pages/SQLChat';

function App() {
  const LoginPage = lazy(() => import('./pages/LoginPage'));
  const navigate = useNavigate();
  const token = localStorage.getItem('access_token');
  const userDataString = localStorage.getItem('user');
  let loginUserData;
  if (userDataString) {
    loginUserData = JSON.parse(userDataString);
  }
  useEffect(() => {
    if (window.location.pathname === '/reset-password' && !loginUserData?.role) {
      navigate('/reset-password');
    } else {
      if (token && loginUserData?.role === 'Individual') {
        navigate('/chat');
      } else if (token && loginUserData?.role) {
        navigate('/');
      } else {
        navigate('/selecttype');
        console.log('loginUserDataAppA', loginUserData);
      }
    }
  }, []);
  return (
    <div>
      <Suspense
        fallback={
          <div className='flex flex-1 h-[100vh]   justify-center items-center'>
            <div>
              <Spin size='large' />
            </div>
          </div>
        }
      >
        <Routes>
          <Route path='/login' element={<LoginPage />} />
          <Route path='/forgot-password' element={<ForgotPassword />} />
          <Route path='/reset-password' element={<ResetPassword />} />
          <Route element={<PrivateRoute />}>
            {loginUserData?.role ? (
              <Route element={<SiteLayout />}>
                <Route path='/' element={<Users />} />
                {/* <Route path='/upload' element={<FileUpload />} /> */}
                <Route path='/chat' element={<Chat />} />
                <Route path='/image-chat' element={<ChatOnImage />} />
                <Route path='/db-connections' element={<ConnectionList />} />
                <Route path='/allover-chat' element={<AllOverChat />} />
                <Route path='/file-chat/:id' element={<DocChat />} />
                <Route path='/sql-chat/:id' element={<SQLChat />} />
                <Route path='/selected-files/chat' element={<SelectedFileChat />} />
                <Route path='/files' element={<Files />} />
                <Route path='/profile' element={<UserProfile />} />
                <Route path='/mfa' element={<TwoFactorAuth />} />
              </Route>
            ) : (
              <Route>
                <Route path='/selecttype' element={<SelectUserRole />} />
                <Route path='/emailverifyfail' element={<EmailVerifyFailPage />} />
              </Route>
            )}
          </Route>
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;
