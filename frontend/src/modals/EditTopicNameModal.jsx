import { Modal, message, Input } from 'antd';
import React, { useState } from 'react';
import { apiPUT } from '../utils/apiHelper';

const EditTopicNameModal = ({ showEditTopicModal, closeEditTopicModal, showEditTopiData }) => {
  const [loading, setLoading] = useState(false);
  const [editedTopicName, setEditedTopicName] = useState('');

  const handleTopicNameEdit = async () => {
    try {
      setLoading(true);

      const payload = {
        topicName: editedTopicName,
      };

      const response = await apiPUT(`/api/update-topic/${showEditTopiData?._id}`, payload);
      if (response?.data?.status===200) {
        message.success('Topic name updated successfully');
        setLoading(false);
        closeEditTopicModal();
      } else {
        message.error('Something went wrong');
        setLoading(false);
        closeEditTopicModal();
      }
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  return (
    <div className='relative z-20'>
      <Modal
        title={`Edit Topic Name : ${showEditTopiData?.topicName} `}
        visible={showEditTopicModal}
        onOk={handleTopicNameEdit}
        onCancel={() => {
          closeEditTopicModal();
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={'Save'}
        cancelText={'Cancel'}
        confirmLoading={loading}
      >
        <Input
          placeholder="Enter new topic name"
          value={editedTopicName}
          onChange={(e) => setEditedTopicName(e.target.value)}
        />
        
      </Modal>
    </div>
  );
};

export default EditTopicNameModal;
