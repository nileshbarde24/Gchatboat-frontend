import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode.react';
import { apiGET, apiPOST, apiPUT } from '../utils/apiHelper';
import { Button, Input, message, Form, Select } from 'antd';
import { Statistic } from 'antd';
import { useNavigate } from 'react-router-dom';
import RemoveGoogleMicrosoftAuthentication from '../modals/RemoveGoogleMicrosoftAuthentication';
import RemoveEmailAuthentication from '../modals/RemoveEmailAuthentication';
import RemoveSmsAuthentication from '../modals/RemoveSmsAuthentication';
const { Countdown } = Statistic;
const TwoFactorAuth = () => {
  const userDataString = localStorage.getItem('user');
  const currentUserData = JSON.parse(userDataString);
  const [loginUserData, setLoginUserData] = useState();
  const email = currentUserData?.email;
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
  const [emailOtpLoading, setEmailOtpLoading] = useState(false);
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false);
  const [verifyPhoneOtpLoading, setverifyPhoneOtpLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const [showEmailAuth, setShowEmailAuth] = useState(false);
  const [showEmailAuthOtp, setShowEmailAuthOtp] = useState(false);
  const [authEmailPassword, setAuthEmailPassword] = useState();

  const [showSMSAuthOtp, setShowSMSAuthOtp] = useState(false);
  const [countryCode, setContryCode] = useState();
  const [phoneNumber, setPhoneNumber] = useState();
  const [form] = Form.useForm();
  const [otpSent, setOtpSent] = useState(false);

  // Remove authentication modals
  const [visibleRemoveGMAuthModal, setVisibleRemoveGMAuthModal] = useState(false);
  const [visibleRemoveEmailAuthModal, setVisibleRemoveEmailAuthModal] = useState(false);
  const [visibleRemoveSmsAuthModal, setVisibleRemoveSmsAuthModal] = useState(false);

  // 10 minutes in seconds
  const [countdownValue, setCountdownValue] = useState(600);

  const showRemoveMFAAuthModal = (removeAuth) => {
    if (removeAuth === 'gmRemoveAuth') {
      setVisibleRemoveGMAuthModal(true);
    } else if (removeAuth === 'emailRemoveAuth') {
      setVisibleRemoveEmailAuthModal(true);
    } else if (removeAuth === 'smsRemoveAuth') {
      setVisibleRemoveSmsAuthModal(true);
    } else {
      console.log(error);
    }
  };

  const onCancelRemoveGMAuthModal = () => {
    setVisibleRemoveGMAuthModal(false);
    getUserById();
  };
  const onCancelRemoveEmailAuthModal = () => {
    setVisibleRemoveEmailAuthModal(false);
    getUserById();
  };
  const onCancelRemoveSmsAuthModal = () => {
    setVisibleRemoveSmsAuthModal(false);
    getUserById();
  };

  const setupTwoFactorAuth = async () => {
    const response = await apiGET('/api/two-factor/setup');
    setSecret(response.data.secret);
    setVerificationSuccess(true);
  };

  const setupEmailFactorAuth = async () => {
    setShowEmailAuth(true);
  };
  const handleOtpChange = (value, index) => {
    const updatedOtp = [...otp];
    updatedOtp[index] = value;
    setOtp(updatedOtp);
  };

  const verifyToken = async (e) => {
    setLoading(true);
    const responseVerifyToken = await apiPOST('/api/two-factor/verify', { token });
    if (responseVerifyToken.data.success) {
      const tofaPayload = {
        isTwoFaAuthinticated: true,
        secretTwoFaAuthinticate: secret.otpauth_url,
        baseToFa: secret.base32,
      };
      const updateToFaUserResponse = await apiPUT(`/api/update-two-factor-user/${currentUserData?._id}`, tofaPayload);
      if (updateToFaUserResponse) {
        message.success('Factor add successfully ');
        getUserById();
        setLoading(false);
        setSecret(false);
        setVerificationSuccess(false);
      }
    } else {
      message.error('Invalid Otp. Please try again.');
      setLoading(false);
    }
  };

  const verifyEmailAuthToken = async () => {
    if (authEmailPassword) {
      try {
        const payload = {
          email: email,
          password: authEmailPassword,
        };
        setEmailOtpLoading(true);
        const otpResponse = await apiPOST(`api/getuserbyemailpassword`, payload);
        if (otpResponse?.status === 200) {
          message.success('Your otp send on registered email');
          setShowEmailAuthOtp(true);
          setShowEmailAuth(true);
          setAuthEmailPassword(null);
          setEmailOtpLoading(false);
          getUserById();
        } else {
          message.error('Something went wrong');
          setEmailOtpLoading(false);
        }
      } catch (error) {
        message.error('Something went wrong');
        setEmailOtpLoading(false);
      }
    } else {
      message.info('Please enter password');
    }
  };

  const handleConfirmEmailAuthOtp = async () => {
    // Handle OTP confirmation logic here
    const fullOtp = otp?.join('');
    try {
      const payload = {
        email: email,
        otp: parseInt(fullOtp),
      };
      const confirmOtpResponse = await apiPOST(`api/matchForgotOtp`, payload);
      if (confirmOtpResponse?.status === 200) {
        const updatepayload = {
          email: email,
          isEmailAuthinticated: true,
        };
        const updateRes = await apiPUT(`api/updatemfauserbyemail`, updatepayload);
        if (updateRes) {
          message.success(confirmOtpResponse?.data?.data);
          setShowEmailAuth(false);
          setShowEmailAuthOtp(false);
          setAuthEmailPassword(false);
          setOtp(null);
          getUserById();
        }
      } else {
        message.error(confirmOtpResponse?.data?.data);
      }
    } catch (error) {
      message.error('Something went wrong');
    }
  };

  const handleTwoFaAuthentication = () => {
    if (loginUserData?.isTwoFaAuthinticated) {
      message.info('Alredy done authenticator app authentication');
    } else {
      setupTwoFactorAuth();
      setShowEmailAuth(false);
      setShowSMSAuthOtp(false);
      setOtpSent(false);
    }
  };

  const sendOTPToPhoneSMS = async (values) => {
    // Implement your logic to send OTP here
    setPhoneOtpLoading(true);
    try {
      const payload = {
        countryCode: values?.countryCode,
        phoneNumber: values?.mobileNumber,
      };
      const sendSMSOtpResponse = await apiPOST(`api/send-otp-authmobile`, payload);
      console.log('sendSMSOtpResponse', sendSMSOtpResponse);
      if (sendSMSOtpResponse?.status === 200) {
        message.success(`OTP sent successfully on : ${values?.mobileNumber} `);
        setPhoneOtpLoading(false);
        getUserById();
        // setShowSMSAuthOtp(true)
        setContryCode(values?.countryCode);
        setPhoneNumber(values?.mobileNumber);
        setOtpSent(true);
        const interval = setInterval(() => {
          setCountdownValue((prevValue) => (prevValue > 0 ? prevValue - 1 : 0));
        }, 1000);

        return () => clearInterval(interval);
      } else {
        message.error(`${values?.mobileNumber} number is not registered`);
        setPhoneOtpLoading(false);
      }
    } catch (error) {
      message.error(error);
      setPhoneOtpLoading(false);
    }
  };

  const verifyOTPToPhoneSMS = async (values) => {
    setverifyPhoneOtpLoading(true);
    try {
      const payload = {
        countryCode: countryCode,
        phoneNumber: phoneNumber,
        otp: values?.otp,
      };
      const sendSMSOtpResponse = await apiPOST(`api/verify-otp-authmobile`, payload);
      if (sendSMSOtpResponse?.status === 200) {
        const updatepayload = {
          email: email,
          isPhoneSmsAuthinticated: true,
        };
        const updateRes = await apiPUT(`api/updatemfauserbyemail`, updatepayload);
        if (updateRes?.status === 200) {
          message.success('OTP Verified!');
          setverifyPhoneOtpLoading(false);
          form.resetFields();
          getUserById();
          setShowSMSAuthOtp(false);
          setOtpSent(false);
        } else {
          message.error('Something went wrong');
          setverifyPhoneOtpLoading(false);
        }
      } else {
        message.error(sendSMSOtpResponse?.data?.data);
        setverifyPhoneOtpLoading(false);
      }
    } catch (error) {
      message.error('Something went wrong');
      setverifyPhoneOtpLoading(false);
    }
  };

  const handleEmailAuthentication = () => {
    if (loginUserData?.isEmailAuthinticated) {
      message.info('Alredy done email authentication');
    } else {
      setupEmailFactorAuth();
      setSecret(false);
      setVerificationSuccess(false);
      setShowSMSAuthOtp(false);
      setOtpSent(false);
    }
  };

  const handlePhoneSmsAuthentication = () => {
    if (loginUserData?.isPhoneSmsAuthinticated) {
      message.info('Already done sms authentication');
    } else {
      setShowSMSAuthOtp(true);
      setShowEmailAuth(false);
      setSecret(false);
    }
  };

  const removeEmailAuthentication = async () => {
    message.info('You want to delete Email authentication');
  };

  const removePhoneSmsAuthentication = async () => {
    message.info('You want to delete Phone Sms authentication');
  };

  const getUserById = async () => {
    try {
      const userRes = await apiGET(`api/getuserby/${currentUserData?._id}`);
      if (userRes?.status === 200) {
        setLoginUserData(userRes?.data?.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getUserById();
  }, []);

  return (
    <div className='bg-white p-8 border rounded-lg shadow-md'>
      <h2 className='text-2xl font-semibold mb-4 text-blue-700'>
        {!secret && !showEmailAuth && !showSMSAuthOtp && 'Set up multi-factor authentication for enhanced security.'}
        {secret && 'Set up authentication with Google or Microsoft Authenticator for an extra layer of security.'}
        {showEmailAuth && 'Set up email authentication to add an additional layer of protection to your account.'}
        {showSMSAuthOtp && 'Set up phone SMS authentication for increased account security.'}
      </h2>
      {/* {!verificationSuccess ? ( */}
      <>
        <div className='flex flex-col gap-3'>
          <div className={`${showEmailAuth || showSMSAuthOtp ? 'hidden' : 'flex gap-4'}`}>
            <Button
              className={`w-[300px] h-10 shadow-lg border-1 ${
                loginUserData?.isTwoFaAuthinticated || secret ? 'bg-blue-700 text-white ' : ''
              }`}
              onClick={() => handleTwoFaAuthentication()}
            >
              {verificationSuccess ? 'Refresh qrcode' : 'Setup Google or Microsoft Authenticator'}
            </Button>
            {loginUserData?.isTwoFaAuthinticated ? (
              <Button
                className='h-10'
                onClick={(gmRemoveAuth) => showRemoveMFAAuthModal((gmRemoveAuth = 'gmRemoveAuth'))}
              >
                Disable
              </Button>
            ) : null}
          </div>
          <div className={`${secret || showSMSAuthOtp ? 'hidden' : ' flex gap-4'}`}>
            <Button
              className={`w-[300px] h-10 shadow-lg border-1 ${
                loginUserData?.isEmailAuthinticated || showEmailAuth ? 'bg-blue-700 text-white cursor-not-allowed' : ''
              }`}
              onClick={() => handleEmailAuthentication()}
            >
              Email
            </Button>
            {loginUserData?.isEmailAuthinticated ? (
              <Button
                className='h-10'
                onClick={(emailRemoveAuth) => showRemoveMFAAuthModal((emailRemoveAuth = 'emailRemoveAuth'))}
              >
                Disable
              </Button>
            ) : null}
          </div>
          <div className={`${secret || showEmailAuth ? 'hidden' : ' flex gap-4'}`}>
            <Button
              className={`w-[300px] h-10 shadow-lg border-1 ${
                loginUserData?.isPhoneSmsAuthinticated || showSMSAuthOtp
                  ? 'bg-blue-700 text-white cursor-not-allowed'
                  : ''
              }`}
              onClick={() => handlePhoneSmsAuthentication()}
            >
              SMS
            </Button>
            {loginUserData?.isPhoneSmsAuthinticated ? (
              <Button
                className='h-10'
                onClick={(smsRemoveAuth) => showRemoveMFAAuthModal((smsRemoveAuth = 'smsRemoveAuth'))}
              >
                Disable
              </Button>
            ) : null}
          </div>
        </div>
        {secret && (
          <div className=''>
            <div className=' mt-2'>
              <ul className=' space-y-2'>
                <li>
                  1. Open{' '}
                  <a
                    href='https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2&hl=en&gl=US&pli=1'
                    target='_blank'
                    className='text-blue-700 cursor-pointer'
                  >
                    Google
                  </a>{' '}
                  or{' '}
                  <a
                    href='https://www.microsoft.com/en-in/security/mobile-authenticator-app'
                    target='_blank'
                    className='text-blue-700 cursor-pointer'
                  >
                    {' '}
                    Microsoft{' '}
                  </a>
                  Authenticator on your phone.
                </li>
                <li>2. Open the Google or Microsoft Authenticator app.</li>
                <li>
                  3. Tap menu,then tap {'Set up account'},then tap {'Scan a barcode'}.{' '}
                </li>
                <li>
                  4. Your phone will now be in a {'scanning'} mode. When you are in this mode, scan the barcode below:
                </li>
              </ul>
            </div>
            <div className='flex  '>
              <QRCode className='border p-2 rounded-lg shadow-md' value={secret.otpauth_url} />
            </div>
            {/* <p>Secret Key: {secret.base32}</p> */}
            <div className='flex flex-col gap-4 mt-4'>
              <p>Once you have scanned the barcode,enter the code below:</p>
              <label className=' font-semibold'>Enter verification code:</label>
              <Input
                className='w-[200px] border-2 p-2'
                type='text'
                value={token}
                onChange={(e) => setToken(e.target.value)}
              />
              <div className='flex gap-4'>
                <Button className='bg-blue-100 text-black  h-10' type='primary' onClick={verifyToken} loading={loading}>
                  {' '}
                  Verify code{' '}
                </Button>
                <Button
                  className='bg-red-700 text-white h-10 '
                  onClick={() => {
                    setSecret(false);
                    setVerificationSuccess(false);
                  }}
                >
                  Cancel{' '}
                </Button>
              </div>
            </div>
          </div>
        )}
        {/* Show Email Auth */}
        {showEmailAuth ? (
          <div className={`${showEmailAuthOtp ? 'hidden' : ''}`}>
            <div className='flex flex-col gap-2 mt-4 '>
              <div className='font-bold text-lg'>Enter your password</div>
              <div>
                A verification code will be sent to the email address you provided :{' '}
                <span className='font-semibold'>{loginUserData?.email}</span>
              </div>
              <div className='flex gap-4 items-center'>
                <Input.Password
                  className=' border-2 my-4 w-[200px] p-2'
                  placeholder='Enter your password'
                  type='password'
                  value={authEmailPassword}
                  onChange={(e) => setAuthEmailPassword(e.target.value)}
                />
                <Button
                  className='bg-blue-100 text-black  h-10'
                  type='primary'
                  onClick={verifyEmailAuthToken}
                  loading={emailOtpLoading}
                >
                  {' '}
                  Confirm{' '}
                </Button>
              </div>
            </div>
            <Button
              className='bg-red-700 text-white h-10 '
              onClick={() => {
                setShowEmailAuth(false);
                setAuthEmailPassword(null);
              }}
            >
              {' '}
              Cancel{' '}
            </Button>
          </div>
        ) : null}
        {/* show email auth otp */}
        {showEmailAuthOtp ? (
          <div>
            <div className='my-4 text-lg font-bold'>OTP Confirmation</div>
            <p>Email: {email}</p>
            <div className='flex  my-4'>
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  style={{ width: 50, margin: '0 5px' }}
                  value={digit}
                  onChange={(e) => handleOtpChange(e.target.value, index)}
                  maxLength={1}
                  className='p-2'
                />
              ))}
            </div>
            <Button
              className='bg-blue-100 text-black  h-10'
              type='primary'
              onClick={handleConfirmEmailAuthOtp}
              disabled={otp.some((digit) => digit === '')}
            >
              Confirm
            </Button>
            <Button
              className='bg-red-700 text-white h-10 ml-4 '
              onClick={() => {
                setShowEmailAuthOtp(false);
                setShowEmailAuth(false);
              }}
            >
              {' '}
              Cancel{' '}
            </Button>
          </div>
        ) : null}

        {/* Show SMS Auth */}
        <div>
          {showSMSAuthOtp ? (
            <div className='mt-4'>
              <Form form={form} layout='vertical' onFinish={sendOTPToPhoneSMS} className={`${otpSent ? 'hidden' : ''}`}>
                <div className=''>
                  <Form.Item
                    name='countryCode'
                    label='Country Code'
                    className='w-[200px]'
                    rules={[{ required: true, message: 'Please select the country code!' }]}
                  >
                    <Select placeholder='Please select country code' style={{ width: '100%', height: '40px' }}>
                      <Select.Option value='+91'>+91(IN)</Select.Option>
                    </Select>
                  </Form.Item>
                  <Form.Item
                    name='mobileNumber'
                    label='Mobile Number'
                    className='w-[200px]'
                    rules={[
                      { required: true, message: 'Please enter your mobile number!' },
                      { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit mobile number!' },
                    ]}
                  >
                    <Input placeholder='Enter mobile number ' className='p-2 w-full' />
                  </Form.Item>
                </div>
                {!otpSent ? (
                  <Form.Item>
                    <Button
                      className='bg-blue-100 text-black  h-10'
                      type='primary'
                      htmlType='submit'
                      loading={phoneOtpLoading}
                    >
                      {' '}
                      Send OTP
                    </Button>
                    <Button
                      className='bg-red-700 text-white h-10 ml-4 '
                      onClick={() => {
                        setShowSMSAuthOtp(false);
                        setShowEmailAuth(false);
                      }}
                    >
                      Cancel{' '}
                    </Button>
                  </Form.Item>
                ) : null}
              </Form>

              {/* for phone otp */}
              {otpSent ? (
                <Form form={form} layout='vertical' onFinish={verifyOTPToPhoneSMS}>
                  <Form.Item
                    name='otp'
                    label={`Enter OTP`}
                    className='w-[200px]'
                    rules={[{ required: true, message: 'Please enter the OTP!' }]}
                  >
                    <Input placeholder='Please enter OTP ' className='p-2 w-full' />
                  </Form.Item>
                  <div className=' flex items-center '>
                    <div className='text-xs font'>OTP expired in minutes :</div>
                    <Countdown
                      value={Date.now() + countdownValue * 1000}
                      format='mm:ss'
                      onFinish={() => console.log('Countdown finished')}
                    />
                  </div>
                  <Form.Item>
                    <Button
                      className='bg-blue-100 text-black  h-10'
                      type='primary'
                      htmlType='submit'
                      loading={verifyPhoneOtpLoading}
                    >
                      Verify
                    </Button>
                  </Form.Item>
                </Form>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Show Remove authentication modals */}
        {visibleRemoveGMAuthModal ? (
          <RemoveGoogleMicrosoftAuthentication
            visibleRemoveGMAuthModal={visibleRemoveGMAuthModal}
            onCancelRemoveGMAuthModal={onCancelRemoveGMAuthModal}
            email={email}
          />
        ) : null}
        {visibleRemoveEmailAuthModal ? (
          <RemoveEmailAuthentication
            visibleRemoveEmailAuthModal={visibleRemoveEmailAuthModal}
            onCancelRemoveEmailAuthModal={onCancelRemoveEmailAuthModal}
            email={email}
          />
        ) : null}
        {visibleRemoveSmsAuthModal ? (
          <RemoveSmsAuthentication
            visibleRemoveSmsAuthModal={visibleRemoveSmsAuthModal}
            onCancelRemoveSmsAuthModal={onCancelRemoveSmsAuthModal}
            email={email}
          />
        ) : null}
      </>
      {/* ) : null} */}
    </div>
  );
};
export default TwoFactorAuth;
