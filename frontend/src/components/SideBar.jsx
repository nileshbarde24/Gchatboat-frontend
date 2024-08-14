import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu } from 'antd';
const { Sider } = Layout;

import {
  FileOutlined,
  TeamOutlined,
  UserOutlined,
  UploadOutlined,
  WechatOutlined,
  FileImageOutlined,
  LogoutOutlined,
  ProfileOutlined,
  SettingFilled,
  ConsoleSqlOutlined,
} from '@ant-design/icons';

import { PiFileSqlDuotone } from 'react-icons/pi';

const SideBar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // console.log('pathname:: ', pathname);
  // console.log('location: ', location);

  const [collapsed, setCollapsed] = useState(false);
  const userDataString = localStorage.getItem('user');
  const loginUserData = JSON.parse(userDataString);

  let logo;
  let width;
  if (collapsed) {
    logo = '';
    width = 40;
  } else {
    // logo = logoLarge;
    logo = '';
    width = 160;
  }

  const activePath = pathname.startsWith('/sql-chat') ? '/db-connections' : pathname;
  // console.log('activePath: ', activePath);
  return (
    <Sider collapsible collapsed={collapsed} onCollapse={(value) => setCollapsed(value)} width={250}>
      <div
        style={{
          height: 32,
          // width: '100%',
          borderRadius: 12,
          margin: 16,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          background: 'rgba(255, 255, 255, 0.2)',
        }}
      >
        {/* <img style={{ cursor: 'pointer' }} onClick={hanldeNavigate} src={logo} width={width} /> */}
        <h3 style={{ cursor: 'pointer', color: 'white', fontSize: 22 }}>{collapsed ? 'G' : 'G Chat-Bot'}</h3>
      </div>
      <Menu
        selectedKeys={[activePath]}
        style={{ marginTop: 40 }}
        theme='dark'
        defaultSelectedKeys='/'
        mode='inline'
        items={[
          loginUserData?.role === 'Administrator' ? { label: 'Users', key: '/', icon: <UserOutlined /> } : null,
          // loginUserData?.role==="Administrator"?{ label: "Upload PDF", key: "/upload", icon: <UploadOutlined /> }:null,
          { label: 'Chat', key: '/chat', icon: <WechatOutlined /> },
          // { label: 'All Over Chat', key: '/allover-chat', icon: <WechatOutlined /> },
          { label: 'Image Analysis', key: '/image-chat', icon: <FileImageOutlined /> },
          { label: 'SQL Analyze', key: '/db-connections', icon: <PiFileSqlDuotone /> },
          { label: 'Files', key: '/files', icon: <FileOutlined /> },
          { label: 'Profile', key: '/profile', icon: <ProfileOutlined /> },
          { label: 'MFA', key: '/mfa', icon: <SettingFilled /> },
        ]}
        onClick={({ key }) => {
          if (key === 'signout') {
            // localStorage.removeItem('token');
            // localStorage.removeItem('token');
            // navigate(`/unauthorized`, { replace: true });
          } else {
            navigate(key);
          }
        }}
      />
      <Menu
        selectedKeys={[pathname]}
        style={{ position: 'fixed', bottom: '50px', backgroundColor: '#002140' }}
        className={`${collapsed ? 'w-[40px]' : 'w-[250px]'}`}
        theme='dark'
        defaultSelectedKeys='/'
        mode='inline'
        items={[
          {
            label: `${
              collapsed ? '' : loginUserData.firstName + ' ' + loginUserData.lastName + ' ' + `(${loginUserData?.role})`
            }`,
            key: 'profile',
            icon: <UserOutlined />,
          },
          { label: 'Logout', key: 'signout', icon: <LogoutOutlined /> },
        ]}
        onClick={({ key }) => {
          if (key === 'signout') {
            localStorage.clear();
            sessionStorage.clear();
            navigate(`/login`, { replace: true });
          } else {
            navigate(key);
          }
        }}
      />
      {/* <Menu
                selectedKeys={[pathname]}
                style={{ position:"fixed", bottom:"90px",backgroundColor:"#002140" }}
                className={`${collapsed?"w-[60px]":"w-[200px]"}`}
                theme="dark"
                defaultSelectedKeys="/"
                mode="inline"
                items={[
                    { label: "Logout", key: "signout", icon: <ProfileOutlined /> },
                ]}
                
            /> */}
    </Sider>
  );
};

export default SideBar;
