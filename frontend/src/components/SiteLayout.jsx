import React, { useState } from 'react';
import { Breadcrumb, Layout, Menu, theme } from 'antd';
import { Outlet, Link } from 'react-router-dom'
import SideBar from './SideBar';
const { Header, Content, Footer, Sider } = Layout;
function getItem(label, key, icon, children) {
    return {
        key,
        icon,
        children,
        label,
    };
}

const SiteLayout = () => {
    const [user, setUser] = useState('Edward');
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout
            style={{
                minHeight: '100vh',
            }}
        >
            <SideBar />
            <Layout>
                {/* <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                >

                </Header> */}
                <Content
                    style={{
                        margin: '0 16px',
                    }}
                >
                    {/* <Breadcrumb
                        style={{
                            margin: '16px 0',
                        }}
                    >
                        <Breadcrumb.Item>PDF Upload</Breadcrumb.Item>
                    </Breadcrumb> */}
                    <div
                        style={{
                            margin: '16px 0',
                            padding: 24,
                            // minHeight: 360,
                            minHeight: '70vh',
                            background: colorBgContainer,
                        }}
                    >
                        {/* <FileUpload /> */}
                        <Outlet />
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: 'center',
                    }}
                >
                    Design and Developed By SDLC Corp ©2023
                </Footer>
            </Layout>
        </Layout>
    );
};
export default SiteLayout;