import React, { useState } from 'react'
import { Modal, Button, Input, message, Spin } from 'antd';
import { apiGET, apiPOST, apiPUT } from '../utils/apiHelper';
import { useNavigate } from 'react-router-dom';
const SelectUserRole = () => {
  const navigate = useNavigate();
    const [showCompany, setShowCompany] = useState(false);
    const [showIndividual, setShowIndividual] = useState(false);
    const [companyName,setCompanyName]=useState()
    const [loading,setLoading] = useState(false)
    const userDataString = localStorage.getItem('user');
    let loginUserData
    if (userDataString) {
       loginUserData = JSON.parse(userDataString);
    }
    console.log("loginUserDataselect",loginUserData)
  const handleOrganizationClick = () => {
    setShowCompany(true);
    setShowIndividual(false)
  }
  const handleIndividualClick = () => {
    setShowCompany(false);
    setShowIndividual(true)
  }
  
  const addOrgnization = async () => {
    setLoading(true)
    const companyPayload = {
      companyName: companyName,
      adminId:loginUserData?._id,
      members:[]
    }
    
    try {
      const companyResponse = await apiPOST(`/api/addCompany`, companyPayload)
      if (companyResponse?.status === 200 ) {
        const getCopanyResponse = await apiGET(`/api/getCompanyByUser/${loginUserData?._id}`)
        if (getCopanyResponse?.status === 200) {
          const updateUserPayload = {
            "accountType": "Organization",
            "companyName": companyName,
            "role": "Administrator",
            "password":"Sample@123",
            "companyId": getCopanyResponse?.data?.data?._id
          }
          const updateUserResponse = await apiPUT(`/api/updateuser/${loginUserData?._id}`, updateUserPayload)
          if(updateUserResponse?.status===200){
            const getUserResponse = await apiGET(`/api/getuserby/${loginUserData?._id}`)
            if(getUserResponse?.status === 200){
            console.log("getuserby",getUserResponse)
              localStorage.setItem('user', JSON.stringify(getUserResponse.data?.data));
              setLoading(false)
              navigate('/')
            }
            message.success("User update successfully")
          }
        }
        
      } else {
        message.error(companyResponse?.data?.message)
        setLoading(false)
      }

    } catch (error) {
      message.error("Something went wrong")
      setLoading(false)
    }
  }
  const addIndividualRole = async ()=>{
    setLoading(true)
    const updateUserPayload = {
      "accountType": "Individual",
      "companyName":null,
      "role": "Individual",
      "password":"Sample@123",
      "companyId": ""
    }
    try {
      const updateUserResponse = await apiPUT(`/api/updateuser/${loginUserData?._id}`, updateUserPayload)
      console.log("updateUserResponse", updateUserResponse)
      if (updateUserResponse.status === 200) {
        const getUserResponse = await apiGET(`/api/getuserby/${loginUserData?._id}`)
        if (getUserResponse?.status === 200) {
          console.log("getuserby", getUserResponse)
          localStorage.setItem('user', JSON.stringify(getUserResponse.data?.data));
          setLoading(false)
          if (getUserResponse.data?.data?.role === "Individual") {
            navigate('/chat');
            message.success("User update successfully")
          } else {
            navigate('/');
            message.success("User update successfully")
          }
        }

      } else {
        message.error("Something went wrong")
        setLoading(false)
      }
    } catch (error) {
      message.error("Something went wrong")
      setLoading(false)
    }
  }

  return (
    <div className='bg-white'>
      <Modal
        title="Select User Role"
        visible={true}
        footer={null}
        closable={false}
        style={{ top: '35%', minHeight: '50vh' }}
      >
        <div className='flex justify-center gap-4'>
          <Button onClick={()=>handleOrganizationClick()} className={`${showCompany?"bg-blue-500 text-white ":""}`}>Organization</Button>
          <Button onClick={()=>handleIndividualClick()} className={`${showIndividual?"bg-blue-500 text-white ":""}`}>Individual</Button>
        </div>
        {showCompany && (
          <div className='mt-4'>
            <label>Enter company name :</label>
            <Input placeholder='Enter company name' onChange={(e)=>{setCompanyName(e.target.value)}} />
            <div className='flex justify-end my-4' ><Button className='bg-blue-100 ' onClick={()=>addOrgnization()} loading={loading}>Proceed</Button></div>
          </div>
        )}
        {showIndividual && (
          <div className='mt-4'>
            <div className='text-center font-bold text-green-500'>You have choose individual role</div>
            <div className='flex justify-end my-4'><Button className='bg-blue-100 ' onClick={()=>addIndividualRole()} loading={loading}>Proceed</Button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}

export default SelectUserRole