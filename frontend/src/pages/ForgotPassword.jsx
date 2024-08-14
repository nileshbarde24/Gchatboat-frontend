import React, { useState } from 'react';
import { Form, Input, Button, Card, message,Spin } from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiPOST } from '../utils/apiHelper';

const PasswordResetPage = () => {
  const navigate = useNavigate();
  const [sendOtpLoding,setSendOtpLoading] = useState(false)
  const [confirmOtpLoding,setConfirmOtpLoading] = useState(false)
  const [resetOtpLoding,setResetOtpLoading] = useState(false)
  const [step, setStep] = useState(1);
  const [form] = Form.useForm();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [matchingPasswords, setMatchingPasswords] = useState(true);
  const [email, setEmail] = useState('');
  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  };

  const handleSendOtp =async (values) => {
    // Handle sending OTP logic here
    setEmail(values.email); // Save the email for later steps
    setSendOtpLoading(true)
    try {
        const payload = {
            email:email
        }
        const otpResponse = await apiPOST(`api/sendOtpForgotPassword`,payload)
        if(otpResponse?.status===200){
            message.success(otpResponse?.data?.data)
            setSendOtpLoading(false)
            setStep(2);
        }else{
            message.error(otpResponse?.data?.data)
            setSendOtpLoading(false)
        }
    } catch (error) {
        message.error("Something went wrong")
        setSendOtpLoading(false)

    }
   
  };

  const handleConfirmOtp = async () => {
    // Handle OTP confirmation logic here
    const fullOtp = otp?.join('');
    setConfirmOtpLoading(true)
    try {
        const payload = {
            email:email,
            otp:parseInt(fullOtp)
        }
        const confirmOtpResponse = await apiPOST(`api/matchForgotOtp`,payload)
        if(confirmOtpResponse?.status===200){
            message.success(confirmOtpResponse?.data?.data)
            setConfirmOtpLoading(false)
            setStep(3);
        }else{
            message.error(confirmOtpResponse?.data?.data)
            setConfirmOtpLoading(false)
        }
    } catch (error) {
        message.error("Something went wrong")
        setConfirmOtpLoading(false)
    }
   
  };

  const handleResetPassword = async (values) => {
    const { newPassword, confirmPassword } = values;
    setResetOtpLoading(true)
    if (newPassword === confirmPassword) {
        const payload = {
            email:email,
            password:matchingPasswords?newPassword:null
        }
        const resetPassRes = await apiPOST(`api/resetPassword`,payload)
        if(resetPassRes?.status===200){
            message.success(resetPassRes?.data?.data)
            setResetOtpLoading(false)
              navigate('/login')
        }else{
            message.error(resetPassRes?.data?.data)
            setResetOtpLoading(false)
        }
    } else {
      // Passwords don't match
      setMatchingPasswords(false);
      setResetOtpLoading(false)
      form.resetFields(['newPassword', 'confirmPassword']);
      message.error('Passwords do not match. Please try again.');
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
      }}
    >
      <Card
        style={{
          width: 500,
          textAlign: 'center',
          border: '1px solid #e8e8e8',
          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        }}
      >
        {step === 1 && (
          <>
            <div className='mb-5 text-lg font-bold'>Forgot Password</div>
            <Form
              name="forgotPassword"
              onFinish={handleSendOtp}
            >
              <Form.Item
                name="email"
                rules={[
                  {
                    required: true,
                    message: 'Please enter your email!',
                  },
                  {
                    type: 'email',
                    message: 'Invalid email format',
                  },
                ]}
              >
                <Input placeholder="Enter Email" onChange={(e)=>{setEmail(e.target.value)}} />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className='bg-blue-100 text-black w-full h-10'
                disabled={sendOtpLoding}
              >
                {sendOtpLoding ?<Spin  className='mr-2'/>:""}Send OTP
              </Button>
            </Form>
          </>
        )}

        {step === 2 && (
          <>
            <div className='mb-5 text-lg font-bold'>OTP Confirmation</div>
            <p>Email: {email}</p>
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
              type="primary"
              onClick={handleConfirmOtp}
              disabled={otp.some((digit) => digit === '') || confirmOtpLoding}
              className='bg-blue-100 text-black w-full h-10' 
            >
              {confirmOtpLoding ?<Spin  className='mr-2'/>:""}Confirm
            </Button>
          </>
        )}

        {step === 3 && (
          <>
            <div className='mb-5 text-lg font-bold'>Reset Password</div>
            <p>Email: {email}</p>
            <Form
              form={form}
              name="resetPassword"
              onFinish={handleResetPassword}
            >
              <Form.Item
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: 'Please enter a new password',
                  },
                ]}
              >
                <Input.Password placeholder="New Password" />
              </Form.Item>
              <Form.Item
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: 'Please confirm your password',
                  },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject('The two passwords do not match');
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Confirm Password" />
              </Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                className='bg-blue-100 text-black w-full h-10'
                disabled={resetOtpLoding}
              >
                {resetOtpLoding ?<Spin  className='mr-2'/>:""}Reset Password
               
              </Button>
            </Form>
          </>
        )}
      </Card>
    </div>
  );
};

export default PasswordResetPage;
