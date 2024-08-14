import React, { useState } from 'react';

import { Form, Input, Button ,message} from 'antd';
import { useNavigate } from 'react-router-dom';
import { apiPOST } from '../utils/apiHelper';
const ResetPassword = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false)
    const onFinish = async (values) => {
        // Handle the form submission logic (e.g., API call for password reset)
        console.log('Received values:', values);
           if(values){
            setLoading(true)
            const payload = {
                email:values.email,
                password:values?.newPassword
            }
            const resetPassRes = await apiPOST(`api/resetPassword`,payload)
            if(resetPassRes?.status===200){
                message.success(resetPassRes?.data?.data)
                setLoading(false)
                  navigate('/login')
            }else{
                message.error(resetPassRes?.data?.data)
                setLoading(false)
            }
           }else{
            message.error("Something went wrong")
            setLoading(false)
           }
        
    };

    return (
        <div className='flex justify-center items-center h-screen'>
        <div className="bg-white p-8 border rounded-lg shadow-md">
          <h1 className='text-center mb-4 font-bold'>Reset Password</h1>
          <Form
            name="resetPasswordForm"
            initialValues={{ remember: true }}
            onFinish={onFinish}
            labelCol={{ span: 10 }} // Adjust the span value based on your layout
            wrapperCol={{ span: 30 }}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: 'Please enter your email!' },
              ]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label="New Password"
              name="newPassword"
              rules={[
                { required: true, message: 'Please enter new password!' },
              ]}
            >
              <Input.Password />
            </Form.Item>
  
            <Form.Item
              label="Confirm Password"
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: 'Please confirm your password!' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error('The two passwords do not match!')
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>
  
            <Form.Item className='flex justify-end'>
              <Button type="primary" htmlType="submit"  className='bg-blue-100 text-black w-full h-10' loading={loading}>
                Reset Password
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    );
};

export default ResetPassword;