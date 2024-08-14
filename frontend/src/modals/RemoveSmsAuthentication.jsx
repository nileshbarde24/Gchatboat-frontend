import React, { useState } from 'react';
import { Modal, Form, Input, Button,message } from 'antd';
import { apiPUT } from '../utils/apiHelper';

const RemoveSmsAuthentication = ({ visibleRemoveSmsAuthModal, onCancelRemoveSmsAuthModal,email }) => {
  const [form] = Form.useForm();
  const [password, setPassword] = useState('');
  const [loading,setLoading] = useState(false)
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
  };

  const handleOk = async () => {
    if(password){
        setLoading(true)
        try {
            const payload = {
                "email": email,
                "password": password,
                "isPhoneSmsAuthinticated":false
            }
            const removeAuthResponse = await apiPUT(`api/remove-mfa`,payload)
            console.log("removeAuthResponse",removeAuthResponse)
            if(removeAuthResponse?.status===200){
                message.success("Successfully deleted authentication")
                setLoading(false)
                onCancelRemoveSmsAuthModal()
            }else{
                message.error(removeAuthResponse?.data?.error)
                setLoading(false)
            }
        } catch (error) {
            console.log(error)
            setLoading(false)
        }
    }else{
        message.info("Please enter password")
    }
        
  };

  return (
    <Modal
    title="Disable authentication"
    visible={visibleRemoveSmsAuthModal}
    onCancel={onCancelRemoveSmsAuthModal}
    footer={[
      <Button key="cancel" onClick={onCancelRemoveSmsAuthModal}>
        Cancel
      </Button>,
      <Button key="submit" type="default" onClick={handleOk} disabled={!password} loading={loading} >
        Submit
      </Button>,
    ]}
  >
    <Form form={form}>
      <Form.Item
        name="password"
        label="Password"
        rules={[
          { required: true, message: 'Please enter your password' },
          // Add any other validation rules as needed
        ]}
      >
        <Input.Password placeholder='Please enter password' onChange={handlePasswordChange} />
      </Form.Item>
    </Form>
  </Modal>
  );
};

export default RemoveSmsAuthentication;
