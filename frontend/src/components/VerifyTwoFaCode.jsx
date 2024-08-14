import React from 'react';
import { useState,useEffect } from 'react';
import { Input, Button, Select, message,Form } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { apiPOST, apiPUT } from '../utils/apiHelper';
import { useNavigate } from 'react-router-dom';
// import QRCode from 'qrcode.react';
const VerifyTwoFaCode = ({ email, password }) => {
    const navigate = useNavigate()
    const [loginUserData,setLoginUserData] = useState()
    console.log("loginUserData veri code",loginUserData)
    const [selectedOption, setSelectedOption] = useState('google');
    const [token, setToken] = useState('');
    const [emailAuthPassword,setEmailAuthPassword] = useState()
    const [showEmailAuthOtp,setShowEmailAuthOtp] = useState(false)
    const [otp, setOtp] = useState(['', '', '', '']);
    const [btnLoading, setBtnLoading] = useState(false)
    const [otpAuthMobileLoding,setOtpAuthMobileLoding] = useState(false)
    const [emailOtpLoding,setEmailOtpLoding] = useState(false)
    const [countryCode, setContryCode] = useState()
    const [phoneNumber, setPhoneNumber] = useState()
    const [form] = Form.useForm();
    const [otpSent, setOtpSent] = useState(false);
    // const [qr,setQr] = useState()

    const verifyCode = async () => {
        if (!token) {
            message.info("Please Enter Otp")
        } else {
            setBtnLoading(true)
            const payload = {
                email: email
            }
            const getUser = await apiPOST(`/api/getuserbyemail`, payload)
            // setQr(getUser.data.data.secretTwoFaAuthinticate)
            const payloadCode = {
                token: token,
                baseToFa: getUser.data.data?.baseToFa
            }
            const responseVerifyToken = await apiPOST('/api/two-factor/verifycode', payloadCode);
            if (responseVerifyToken.data.success) {
                let payload = { email: email, password: password }
                let response = await apiPOST("api/login", payload);
                if (response.data.status) {
                    const tofaPayload = {
                        isTwoFaAuthinticated: true,
                        baseToFa: getUser.data.data?.baseToFa,
                        secretTwoFaAuthinticate: getUser.data.data.secretTwoFaAuthinticate
                    }
                    const updateToFaUserResponse = await apiPUT(`/api/update-two-factor-user/${response?.data?.data?._id}`, tofaPayload)
                    console.log("updateToFaUserResponse", updateToFaUserResponse)
                    if (updateToFaUserResponse) {
                        localStorage.setItem('access_token', response.data?.data?.access_token);
                        localStorage.setItem('refresh_token', response.data?.data?.refresh_token);
                        localStorage.setItem('user', JSON.stringify(response.data?.data));
                        setBtnLoading(false)
                        //send on permissional route
                        if (response.data?.data?.role[0] === "End-User" || response.data?.data?.role === "Individual") {
                            navigate('/chat');
                            message.success('Login successful!');
                        } else {
                            navigate('/');
                            message.success('Login successful!');
                        }
                    }

                } else {
                    message.error('Login failed. Please check your credentials.');
                    setBtnLoading(false)
                }
                // Redirect to login page or dashboard here
            } else {
                message.error('Invalid Otp. Please try again.');
                setBtnLoading(false)
            }
        }
    }

    const handleOtpChange = (value, index) => {
        const updatedOtp = [...otp];
        updatedOtp[index] = value;
        setOtp(updatedOtp);
      };
      
    const verifyEmailAuthOtp = async () => {
        setEmailOtpLoding(true)
        if(emailAuthPassword){
            try {
                const payload = {
                    email: email,
                    password:emailAuthPassword
                }
                const otpResponse = await apiPOST(`api/getuserbyemailpassword`, payload)
                if(otpResponse?.status===200){
                    message.success("Your otp send on registered email")
                    setEmailOtpLoding(false)
                    setShowEmailAuthOtp(true)
                    
                }else{
                    message.error("Something went wrong")
                    setEmailOtpLoding(false)
                }
    
            } catch (error) {
               message.error("Something went wrong")
               setEmailOtpLoding(false)
            }
        }else{
            message.info("Please enter password")
            setEmailOtpLoding(false)
        }
       
    }

    const handleConfirmOtp = async () => {
        // Handle OTP confirmation logic here
        setBtnLoading(true)
        const fullOtp = otp?.join('');
        try {
            const payload = {
                email:email,
                otp:parseInt(fullOtp)
            }
            const confirmOtpResponse = await apiPOST(`api/matchForgotOtp`,payload)
            if(confirmOtpResponse?.status===200){
                    message.success(confirmOtpResponse?.data?.data)
                    let payload = { email: email, password: password }
                    let response = await apiPOST("api/login", payload);
                if (response.data.status) {
                    //send on permissional route
                    setBtnLoading(false)
                    if (response.data?.data?.role[0] === "End-User" || response.data?.data?.role === "Individual") {
                        localStorage.setItem('access_token', response.data?.data?.access_token);
                        localStorage.setItem('refresh_token', response.data?.data?.refresh_token);
                        localStorage.setItem('user', JSON.stringify(response.data?.data));
                        navigate('/chat');
                        message.success('Login successful!');
                    } else {
                        localStorage.setItem('access_token', response.data?.data?.access_token);
                        localStorage.setItem('refresh_token', response.data?.data?.refresh_token);
                        localStorage.setItem('user', JSON.stringify(response.data?.data));
                        navigate('/');
                        message.success('Login successful!');
                    }
                    }
               
            }else{
                message.error(confirmOtpResponse?.data?.data)
                setBtnLoading(false)
            }
        } catch (error) {
            message.error("Something went wrong")
            setBtnLoading(false)
        }
       
      };

      const sendOTPToPhoneSMS = async (values) => {
        console.log("DFFF", values)
        // Implement your logic to send OTP here
        try {
            const payload = {
                "countryCode": values?.countryCode,
                "phoneNumber": values?.mobileNumber,
            }
            setOtpAuthMobileLoding(true)
            const sendSMSOtpResponse = await apiPOST(`api/send-otp-authmobile`, payload)
            if (sendSMSOtpResponse) {
                message.success('OTP sent successfully!');
                setOtpAuthMobileLoding(false)
                setContryCode(values?.countryCode)
                setPhoneNumber(values?.mobileNumber)
                setOtpSent(true);
            }
        } catch (error) {
            message.error(error)
            setOtpAuthMobileLoding(false)
        }

    };

    const verifyOTPToPhoneSMS = async (values) => {
       setBtnLoading(true)
        try {
            const payload = {
                "countryCode": countryCode,
                "phoneNumber": phoneNumber,
                "otp": values?.otp
            }
            const sendSMSOtpResponse = await apiPOST(`api/verify-otp-authmobile`, payload)
            if (sendSMSOtpResponse?.status === 200) {
                const updatepayload = {
                    email: email,
                    isPhoneSmsAuthinticated: true

                }
                const updateRes = await apiPUT(`api/updatemfauserbyemail`, updatepayload)
                if (updateRes) {
                    message.success('OTP Verified!');
                    setBtnLoading(false)
                    form.resetFields();
                    setOtpSent(false);
                    let payload = { email: email, password: password }
                let response = await apiPOST("api/login", payload);
                if (response.data.status) {
                   
                        localStorage.setItem('access_token', response.data?.data?.access_token);
                        localStorage.setItem('refresh_token', response.data?.data?.refresh_token);
                        localStorage.setItem('user', JSON.stringify(response.data?.data));
                        setBtnLoading(false)
                        //send on permissional route
                        if (response.data?.data?.role[0] === "End-User" || response.data?.data?.role === "Individual") {
                            navigate('/chat');
                            message.success('Login successful!');
                        } else {
                            navigate('/');
                            message.success('Login successful!');
                        }
                    

                } else {
                    message.error('Login failed. Please check your credentials.');
                    setBtnLoading(false)
                }
                }else{
                    message.error("Something went wrong")
                    setBtnLoading(false)
                }
                
            } else {
                message.error(sendSMSOtpResponse?.data?.data)
                setBtnLoading(false)
            }
        } catch (error) {
            message.error("Something went wrong")
        }

    };

    const getUserById = async ()=>{
        try {
            const payload = {
                email:email
            }
            const userRes = await apiPOST(`api/getuserbyemail`,payload)
            if(userRes?.status===200){
                setLoginUserData(userRes?.data?.data)
            }
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(()=>{
        getUserById();
    },[])

    return (
        <div className="w-[550px] mx-auto mt-8 p-6 border-2 shadow-md rounded-md ">
      <Select
        placeholder="Select Authenticator App"
        suffixIcon={<DownOutlined />}
        style={{ width: '50%' ,height:"40px"}}
        defaultValue={loginUserData?.isTwoFaAuthinticated?"google":null || loginUserData?.isEmailAuthinticated?"email":null || loginUserData?.isPhoneSmsAuthinticated?"sms":null}
        onChange={(value) => setSelectedOption(value)}
      >
        {loginUserData?.isTwoFaAuthinticated?<Option value="google">Google Authenticator</Option>:null}
        {loginUserData?.isEmailAuthinticated? <Option value="email">Email</Option>:null}
        {loginUserData?.isPhoneSmsAuthinticated?<Option value="sms">SMS</Option>:null}
        
        {/* Add more options as needed */}
      </Select>

            {selectedOption === 'google' && loginUserData?.isTwoFaAuthinticated && (
                <>
                    <div className=" mt-2">
                        <ul className=" space-y-2">
                            <li>1. Open <a href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US&pli=1' target='_blank' className='text-blue-700 cursor-pointer'>Google</a> or <a href='https://www.microsoft.com/en-in/security/mobile-authenticator-app' target='_blank' className='text-blue-700 cursor-pointer'> Microsoft </a>Authenticator on your phone.</li>
                            <li>2. Tap the menu and find your account.</li>
                            <li>3. Enter the code provided:</li>
                        </ul>
                    </div>
                    <Input
                        placeholder="Enter OTP"
                        className="my-4 p-2"
                        value={token}
                        onChange={(e) => setToken(e.target.value)}
                    />
          <Button
            className='bg-blue-100 text-black  h-10' type="primary"
            onClick={verifyCode}
            loading={btnLoading}
          >
            Verify code
          </Button>
        </>
      )}

      {selectedOption === 'email' && loginUserData?.isEmailAuthinticated && (
        <>
          <div className={`${showEmailAuthOtp?"hidden":""}`}>
          <Input.Password
            type="password"
            placeholder="Enter registered email password"
            className="my-4 p-2"
            value={emailAuthPassword}
            onChange={(e) => setEmailAuthPassword(e.target.value)}
          />
          <Button
            className='bg-blue-100 text-black  h-10' type="primary"
            onClick={verifyEmailAuthOtp}
            loading={emailOtpLoding}
          >
            Confirm
          </Button>
          </div>
          {
                    showEmailAuthOtp ?
                        <div>
                            <div className='mt-4 text-lg font-bold'>OTP Confirmation</div>
                            <p className='my-2'>Email: {email}</p>
                            <div className='flex justify-center mb-4'>
                                {otp.map((digit, index) => (
                                    <Input
                                        key={index}
                                        style={{ width: 50, margin: '0 5px' }}
                                        value={digit}
                                        onChange={(e) => handleOtpChange(e.target.value, index)}
                                        maxLength={1}
                                    />
                                ))}
                            </div>
                            <Button
                                onClick={handleConfirmOtp}
                                disabled={otp.some((digit) => digit === '')}
                                className='bg-blue-100 text-black  h-10' type="primary"
                                loading={btnLoading}
                            >
                                Confirm
                            </Button>
                        </div> : null
                }
        </>
      )}

      {
        selectedOption ==="sms" && loginUserData?.isPhoneSmsAuthinticated ?
        <div className='mt-4'>
        <Form
            form={form}
            layout="vertical"
            onFinish={sendOTPToPhoneSMS}
            className={`${otpSent?"hidden":""}`}
        >
            <div className=''>
                <Form.Item
                    name="countryCode"
                    label="Country Code"
                    rules={[
                        { required: true, message: 'Please select the country code!' },
                    ]}
                    
                >
                    <Select  style={{ width: '100%',height:"40px" }}>
                        <Select.Option value="+91">+91(IN)</Select.Option>
                    </Select>
                </Form.Item>
                <Form.Item
                    name="mobileNumber"
                    label="Mobile Number"
                    rules={[
                        { required: true, message: 'Please enter your mobile number!' },
                    ]}
                >
                    <Input className='p-2' style={{ width: '100%' }} />
                </Form.Item>
            </div>
            {!otpSent ?
                <Form.Item>
                    <Button className='bg-blue-100 text-black h-10' type="primary" htmlType="submit" loading={otpAuthMobileLoding}> Send OTP</Button>
                    {/* <Button className='bg-red-700 text-white ml-4 ' >Cancel </Button> */}
                </Form.Item>
                :
                null}
        </Form>

        {/* for phone otp */}
        {
            otpSent ?
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={verifyOTPToPhoneSMS}
                >
                    <Form.Item
                        name="otp"
                        label="Enter OTP"
                        className='p-2'
                        rules={[
                            { required: true, message: 'Please enter the OTP!' },
                        ]}
                    >
                        <Input style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button className='bg-blue-100 text-black  h-10' type="primary" htmlType="submit" loading={btnLoading}>
                            Verify
                        </Button>
                    </Form.Item>
                </Form>
                : null
        }
    </div>
        :
        null
      }

    </div>
    );
};

export default VerifyTwoFaCode;
