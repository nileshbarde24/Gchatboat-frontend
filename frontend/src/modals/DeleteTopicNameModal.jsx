import { Modal, message, Input } from 'antd';
import React, { useState } from 'react';
import { apiDELETE, apiPUT } from '../utils/apiHelper';
const DeleteTopicNameModal = ({ showDeleteTopicModal, closeDeleteTopicModal, showDeleteTopicData }) => {
  const [loading, setLoading] = useState(false);

  const handleTopicNameDelete = async () => {
    try {
      setLoading(true);
      const response = await apiDELETE(`/api/delete-topic/${showDeleteTopicData?._id}`);
      console.log("response",response)
      if (response?.data?.status===200) {
        message.success('Topic deleted successfully');
        setLoading(false);
        closeDeleteTopicModal();
      } else {
        message.error('Something went wrong');
        setLoading(false);
        closeDeleteTopicModal();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className='relative z-20'>
      <Modal
        title={`Delete Topic Name : ${showDeleteTopicData?.topicName} `}
        visible={showDeleteTopicModal}
        onOk={handleTopicNameDelete}
        onCancel={() => {
          closeDeleteTopicModal();
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={'Delete'}
        cancelText={'Cancel'}
        confirmLoading={loading}
      >
      </Modal>
    </div>
  );
};

export default DeleteTopicNameModal;
