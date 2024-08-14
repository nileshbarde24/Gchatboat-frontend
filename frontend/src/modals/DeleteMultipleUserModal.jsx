import { Modal, message } from 'antd'
import React, { useState } from 'react'
import { apiPUT } from '../utils/apiHelper'

const DeleteMultipleUserModal = ({deleteMultipleUserModalVisible,closeDeleteMulipleUserModal,selectedRowKeys}) => {
     const [loding,setLoding] = useState(false)
    const handleMultipleUserDelete = async ()=>{
        try {
            setLoding(true)
            const payload = {
                "userIds":selectedRowKeys
            }
            const response = await apiPUT(`/api/delete-multiple-user`,payload)
            if(response?.status===200){
                message.success("User deleted successfully")
                setLoding(false)
                closeDeleteMulipleUserModal()
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
        visible={deleteMultipleUserModalVisible} // Set the visibility based on your logic
        onOk={handleMultipleUserDelete}
        onCancel={() => {
            closeDeleteMulipleUserModal()
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={"Delete"}
        confirmLoading={loding}
      >
        {/* Add content for the modal, e.g., a message or additional options */}
        <p><span className='text-yellow-700 text-base font-bold'>Warning:</span> Are you sure you want to delete this users?</p>
        <p className="warning"> Deleting all related data for this users will result in permanent data loss.</p>
      </Modal>
    </div>
  )
}

export default DeleteMultipleUserModal