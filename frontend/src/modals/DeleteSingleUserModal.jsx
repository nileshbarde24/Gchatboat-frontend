import { Modal, message } from 'antd'
import React, { useState } from 'react'
import { apiPUT } from '../utils/apiHelper'

const DeleteSingleUserModal = ({deleteUserModalVisible,closeDeleteUserModal,singleUserRecord}) => {
     const [loding,setLoding] = useState(false)
    const handleUserDelete = async ()=>{
        try {
            setLoding(true)
            const response = await apiPUT(`/api/delete-single-user/${singleUserRecord?.userId}`)
            if(response?.status===200){
                message.success("User deleted successfully")
                setLoding(false)
                closeDeleteUserModal()
            }else{
                message.error("Something went wrong")
                setLoding(false)
            }
        } catch (error) {
            console.log(error)
            setLoding(false)
        }
    }
  return (
    <div>
        <Modal
        title={`User Delete`}
        visible={deleteUserModalVisible} // Set the visibility based on your logic
        onOk={handleUserDelete}
        onCancel={() => {
            closeDeleteUserModal()
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={"Delete"}
        confirmLoading={loding}
      >
        {/* Add content for the modal, e.g., a message or additional options */}
        <p><span className='text-yellow-700 text-base font-bold'>Warning:</span> Are you sure you want to delete this user?</p>
        <p className="warning"> Deleting all related data for this user will result in permanent data loss.</p>
      </Modal>
    </div>
  )
}

export default DeleteSingleUserModal