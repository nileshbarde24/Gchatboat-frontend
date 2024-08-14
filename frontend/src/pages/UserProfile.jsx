import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Button, Space, Typography, Row, Col, message } from 'antd';
import { apiGET, apiPUT } from '../utils/apiHelper';

import {
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
const { Option } = Select;
const { Text } = Typography;

const UserProfile = () => {
  const [editMode, setEditMode] = useState(false);
  const [isFieldsTouched, setIsFieldsTouched] = useState(false);
  const [userData,setUserData] = useState()
  console.log("userData???",userData)
  const formRef = React.createRef();
  const userDataString = localStorage.getItem('user');
  let loginUserData
  if (userDataString) {
     loginUserData = JSON.parse(userDataString);
  }

  const getLoginUser = async ()=>{
    try {
      const getUserResponse = await apiGET(`/api/getuserby/${loginUserData?._id}`)
      if(getUserResponse?.status === 200){
        setUserData(getUserResponse?.data?.data)
        }
    } catch (error) {
      
    }
  }


  const onFinish = async (values) => {
    // You can handle the form submission here
    console.log("LLL",values);
    const updateUserPayload = {
      "firstName": values?.firstName,
      "lastName": values?.lastName,
      "email": values?.email,
      "oldpassword":values.oldpassword,
      "password": values?.password,
      "accountType": loginUserData?.accountType,
      "role": loginUserData?.role,
      "companyId": loginUserData?.companyId,
      "isEmailVerified": loginUserData?.isEmailVerified,
      "emailToken": loginUserData?.emailToken,
      "companyName": loginUserData?.companyId
  }
   
    const updateUserResponse = await apiPUT(`/api/ownProfileUpdate/${loginUserData?._id}`, updateUserPayload)
    if(updateUserResponse?.status===200){
      message.success("Details updated successfully")
      getLoginUser()
      setEditMode(false);
      setIsFieldsTouched(false);
    }else{
      message.error(updateUserResponse?.data?.error)
    }
   
  };

  const handleEdit = () => {
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditMode(false);
    setIsFieldsTouched(false);
    formRef.current.resetFields();
  };

  const onValuesChange = (_, values) => {
    if (Object.keys(values).length > 0) {
      setIsFieldsTouched(true);
    }
  };

  useEffect(()=>{
    getLoginUser()
  },[])

  return (
    <div className='w-[500px]'>
      <div className='font-bold text-lg'>{editMode?"Edit user profile":"User profile"}</div>
          {editMode ? (
            <Form
              labelCol={{ span: 6 }}
              wrapperCol={{ span: 16 }}
              name="user-profile-form"
              onFinish={onFinish}
              initialValues={{ firstName: userData?.firstName, lastName: userData?.lastName, email: userData?.email }}
              onValuesChange={onValuesChange}
              ref={formRef}
            >
              <Form.Item labelAlign="left"  label="First Name" name="firstName" rules={[{ required: true, message: 'Please enter your first name' }]}>
                <Input className='p-2' />
              </Form.Item>
              <Form.Item labelAlign="left"   label="Last Name" name="lastName" rules={[{ required: true, message: 'Please enter your last name' }]}>
                <Input className='p-2' />
              </Form.Item>
              <Form.Item labelAlign="left"  label="Email" name="email" rules={[{ required: true, message: 'Please enter your email' }]}>
                <Input className='p-2' />
              </Form.Item>
              {userData?.password?
              <Form.Item labelAlign="left"  label="Old password" name="oldpassword" rules={[{ required: true, message: 'Please select your account type' }]}>
              <Input className='p-2'  placeholder='Please enter old password'/>
              </Form.Item>:null}
              {userData?.password?
              <Form.Item labelAlign="left"  label="New password" name="password" rules={[{ required: true, message: 'Please select your account type' }]}>
              <Input className='p-2' placeholder='Please enter new password' />
              </Form.Item>:null}
              <Form.Item>
                <Space>
                  <Button
                    type="primary"
                    htmlType="submit"
                    className=' border border-blue-500 bg-[#1677ff]'
                    disabled={!isFieldsTouched}
                  >
                    {isFieldsTouched ? "Update Details" : "Save"}
                  </Button>
                  <Button onClick={handleCancel} className=' border border-blue-500'>
                    Cancel
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          ) : (
            <div className='w-full flex flex-col gap-4'>
                <div className='flex gap-2 items-center'>
                    <Text  className='w-[150px] text-base'>First Name :</Text>
                    <div className='border w-full p-2 rounded-md  h-[40px]'>{userData?.firstName?userData?.firstName:"--"}</div>
              </div>
                <div className='flex gap-2 items-center'>
                <Text  className='w-[150px] text-base'>Last Name :</Text>
              <div className='border w-full  p-2 rounded-md h-[40px]'>{userData?.lastName?userData?.lastName:"--"}</div>
              </div>
                <div className='flex gap-2 items-center'>
                <Text  className='w-[150px] text-base'>Email :</Text>
              <div className='border w-full p-2 rounded-md  h-[40px]'>{userData?.email?userData?.email:"--"}</div>
              </div>
              <div className='flex gap-2 items-center'>
                <Text  className='w-[150px] text-base'>Account type :</Text>
              <div className='border w-full p-2 rounded-md h-[40px] '>{userData?.accountType?userData?.accountType:"--"}</div>
              </div>
            
              
              <Button onClick={handleEdit} type="primary" className=' w-[100px] border border-blue-500 bg-[#1677ff]'>
                Edit
              </Button>
            </div>
          )}
    </div>
  );
};

export default UserProfile;
