import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import GoogleLog from '../config/GoogleLogin';
import { apiPOST } from '../utils/apiHelper';
import FacebookLog from '../config/FacebookLogin';
import { Button, Input, Select, Spin, message } from 'antd';
import { PublicClientApplication, EventType } from "@azure/msal-browser";
import { msalConfig } from "../config/authMasalConfig";
import MicrosoftLoginButton from '../config/MicrosoftLoginButton';
import TwoFactorAuth from '../components/TwoFactorAuth';
import VerifyTwoFaCode from '../components/VerifyTwoFaCode';
import {
    MailOutlined,
    KeyOutlined,
    UserAddOutlined,
    DownOutlined,
    LockOutlined
} from '@ant-design/icons';
const msalInstance = new PublicClientApplication(msalConfig);
if (!msalInstance.getActiveAccount() && msalInstance.getAllAccounts().length > 0) {
    msalInstance.setActiveAccount(msalInstance.getActiveAccount()[0]);
}

msalInstance.addEventCallback((event) => {
    if (event.eventType === EventType.LOGIN_SUCCESS && event.payload.account) {
        const account = event.payload.account;
        msalInstance.setActiveAccount(account);
    }
});
const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [accountType, setAccountType] = useState('Individual'); // Default to 'Individual'
    const [companyName, setCompanyName] = useState('');
    const [error, setError] = useState('');
    const [isLoginPage, setIsLoginPage] = useState(true)
    const [loading, setLoading] = useState(false);
    const [currentUserData,setCurrentUserData] =  useState()

    //for MFA authenticators
    
    const [verifyMFaCode, setVerifyMFaCode] = useState(false)

    const handleLogin = async () => {
        const userDataString = localStorage.getItem('user');
    const loginUserData = JSON.parse(userDataString);
    console.log("loginUserData",loginUserData)
    if(!loginUserData){
        setLoading(true)
            let payload = { email: email, password: password }
            let response = await apiPOST("api/login", payload);
            if (response.data.status) {
                if(response?.data?.data?.userStatus==="enabled"){
                    if(response?.data?.data?.isTwoFaAuthinticated || response?.data?.data?.isEmailAuthinticated || response?.data?.data?.isPhoneSmsAuthinticated){
                        setVerifyMFaCode(true)
                    }else{
                        localStorage.setItem('access_token', response.data?.data?.access_token);
                        localStorage.setItem('refresh_token', response.data?.data?.refresh_token);
                        localStorage.setItem('user', JSON.stringify(response.data?.data));
    
                        //send on permissional route
                        if (response.data?.data?.role[0] === "End-User" || response.data?.data?.role === "Individual") {
                            navigate('/chat');
                            message.success('Login successful!');
                            setLoading(false)
                        } else {
                            navigate('/');
                            message.success('Login successful!');
                            setLoading(false)
                        }
                    }
                }else{
                    message.info("You do not have permission to log in. Please contact with administrator");
                    setLoading(false)
                }
                    
                    
            } else {
                message.error('Login failed. Please check your credentials.');
                setLoading(false)
            }
    }else{
        message.error("Something went wrong")
    }            

    };

    const handleRegistered = async () => {
        setLoading(true)
        const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
        if (!emailRegex.test(email)) {
            message.info('Invalid email address');
            setLoading(false);
            return;
        }
        let payload = {
            firstName: firstName,
            lastName: lastName,
            email: email, password: password,
            accountType: accountType,
            companyName: companyName,
            userType: accountType === "Organization" ? "Administrator" : accountType,
            role: accountType === "Organization" ? "Administrator" : accountType,
            secretTwoFaAuthinticate: null,
            isTwoFaAuthinticated: false,
            isEmailAuthinticated:false,
            isPhoneSmsAuthinticated:false
        }
        let response = await apiPOST("api/register", payload);
        if (response.data.status) {
            if (response.data?.data?.role[0] === "End-User" || response.data?.data?.role === "Individual") {
                setIsLoginPage(true)
                message.success('Registered successful!');
                setLoading(false)
            } else {
                setIsLoginPage(true)
                message.success('Registered successful!');
                setLoading(false)
            }

        }
        else {
            message.error(response?.data?.message)
            setLoading(false)

        }
    }


    const googleLogin = async (data) => {
        let payload = {
            email: data.email,
            firstName: data.given_name,
            lastName: data.family_name,
        }
        try {

            let response = await apiPOST("api/socialLogin", payload);
            if (response?.data?.status) {
                localStorage.setItem('access_token', response?.data?.data?.access_token);
                localStorage.setItem('refresh_token', response?.data?.data?.access_token);
                localStorage.setItem('user', JSON.stringify(response.data?.data));
                console.log("google login", response?.data?.data?.role)
                if (response?.data?.data?.role === "Individual" || response?.data?.data?.role === "Administrator") {
                    navigate('/');
                } else {
                    navigate('/selecttype');
                }

            }
        } catch (error) {
            console.log("error while calling login api------", error)

        }
    }
    const facebookLogin = async (data) => {
        console.log(">>>>>", data);
        let names = data.name.split(" ");
        let firstName = names[0];
        let lastName = names.slice(1).join(" ");
        let payload = {
            email: data.email,
            firstName: firstName,
            lastName: lastName
        }
        try {

            localStorage.clear();
            let response = await apiPOST("api/socialLogin", payload);
            console.log(response)
            if (response.data?.status) {
                localStorage.setItem('access_token', response?.data?.data?.access_token);
                localStorage.setItem('refresh_token', response?.data?.data?.access_token);
                localStorage.setItem('user', JSON.stringify(response.data?.data));
                if (response?.data?.data?.role === "Individual" || response?.data?.data?.role === "Administrator") {
                    navigate('/');
                } else {
                    navigate('/selecttype');
                }
            }
        } catch (error) {
            console.log("error while calling login api------", error)

        }
    }
    
    return (
        <div className="flex h-screen justify-center items-center ">
         {
            verifyMFaCode?<VerifyTwoFaCode email={email} password={password} />
         :
            <div className='w-[500px]'>
                {isLoginPage ?

                    <div className="bg-white p-8 border rounded-lg shadow-md">
                        <h2 className="text-2xl font-semibold mb-4">Login</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <Input
                            type="text"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            prefix={<MailOutlined/>}
                        />
                        <Input.Password
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-2 border rounded mb-4"
                            prefix={<LockOutlined />}
                        />
                        <div className="text-sm pb-1  text-blue-500 flex justify-end" ><div onClick={() => navigate('/forgot-password')} className='cursor-pointer' >Forgot Password?</div></div>

                        <Button className='bg-blue-100 text-black w-full h-10' type="primary" htmlType='submit' onClick={handleLogin} loading={loading} >
                            Login
                        </Button>
                        <div className='flex flex-row items-center mt-4'>
                            <div className='border-t-2 flex-grow'></div>
                            <div className='flex justify-center items-center p-1'>Or</div>
                            <div className='border-t-2 flex-grow'></div>
                        </div>
                        <div className='flex flex-wrap justify-center w-full items-center gap-4 my-4'>
                            <GoogleLog func={googleLogin} />
                            <FacebookLog func={facebookLogin} />
                            <MicrosoftLoginButton instance={msalInstance} />
                        </div>
                        <div className='flex gap-2 justify-center item-center'>
                            <div>you're not registered?</div>
                            <div onClick={() => setIsLoginPage(false)} className="cursor-pointer text-blue-500 ">Sign up</div>
                        </div>
                    </div>

                    :
                    <div className="bg-white p-8 border rounded-lg shadow-md ">
                        <h2 className="text-2xl font-semibold mb-4">Register</h2>
                        {error && <p className="text-red-500 mb-4">{error}</p>}
                        <div className="relative mb-4">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="w-full p-2 border rounded"
                                onKeyPress={(e) => {
                                    // Check if the character is not a letter (a-z or A-Z)
                                    if (!/^[a-zA-Z]+$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                prefix={<UserAddOutlined/>}

                            />
                            <div className="absolute top-2 right-3 text-red-500">*</div>
                        </div>
                        <div className="relative mb-4">
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                className="w-full p-2 border rounded"
                                onKeyPress={(e) => {
                                    // Check if the character is not a letter (a-z or A-Z)
                                    if (!/^[a-zA-Z]+$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                prefix={<UserAddOutlined/>}
                            />
                        </div>
                        <div className="relative mb-4">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full p-2 border rounded"
                                onKeyPress={(e) => {
                                    // Check if the character is not a letter (a-z or A-Z)
                                    if (!/^[a-zA-Z@.0-9]+$/.test(e.key)) {
                                        e.preventDefault();
                                    }
                                }}
                                prefix={<MailOutlined/>}
                            />
                            <div className="absolute top-2 right-3 text-red-500">*</div>
                        </div>
                        <div className="relative mb-4">
                            <Input.Password
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full p-2 border rounded"
                                  prefix={<LockOutlined />}
                            />
                            <div className="absolute top-2 right-3 text-red-500">*</div>
                        </div>
                        <div className="relative mb-4">
                            <Select
                              placeholder="Select account type"
                               suffixIcon={<DownOutlined />}
                                onChange={(value) => setAccountType(value)}
                                className="w-full h-10 "
                            >
                                <Option value="Selectaccounttype" disabled>Select account type</Option>
                                <Option value="Individual">Individual</Option>
                                <Option value="Organization">Organization</Option>
                            </Select>
                            <div className="absolute top-2 right-3 text-red-500">*</div>
                        </div>
                        {accountType === 'Organization' && (
                            <div className="relative mb-4">
                                <Input
                                    type="text"
                                    placeholder="Company Name"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    className="w-full p-2 border rounded"
                                    onKeyPress={(e) => {
                                        // Check if the character is a letter (a-z or A-Z), a number (0-9), or specific symbols
                                        if (companyName.trim() === '' && e.key === ' ') {
                                            e.preventDefault(); // Disallow leading spaces
                                        }
                                    }}
                                />
                                <div className="absolute top-2 right-3 text-red-500">*</div>
                            </div>
                        )}

                        <Button className='bg-blue-100 text-black w-full h-10' type="primary" htmlType='submit' onClick={handleRegistered} loading={loading} >
                            Sign Up
                        </Button>
                        <div className='flex flex-row items-center mt-4'>
                            <div className='border-t-2 flex-grow'></div>
                            <div className='flex justify-center items-center p-1'>Or</div>
                            <div className='border-t-2 flex-grow'></div>
                        </div>
                        <div className='flex  flex-wrap justify-center w-full items-center gap-4 my-4'>
                            <GoogleLog func={googleLogin} />
                            <FacebookLog func={facebookLogin} />
                            <MicrosoftLoginButton instance={msalInstance} />
                        </div>
                        <div className='flex gap-2 justify-center item-center'>
                            <div>already registered?</div>
                            <div onClick={() => setIsLoginPage(true)} className="cursor-pointer text-blue-500 ">Login</div>
                        </div>
                    </div>

                }
            </div>
        }
        </div>
    );
};

export default LoginPage;
