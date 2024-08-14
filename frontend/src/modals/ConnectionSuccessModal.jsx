import React from 'react';
import { Modal } from 'antd';

const ConnectionSuccessModal = ({ handleCancel, handleOk, isModalOpen, connection }) => {
  return (
    <Modal
      zIndex={1000}
      title='Connection Made Successfully'
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ className: 'bg-blue-500' }}
    >
      <p>Information related to this connection:</p>
      <br />
      <p>Host: {connection?.host || ''}</p>
      <p>Port: {connection?.port || ''}</p>
      <p>User: {connection?.username || ''}</p>
      <p>Datbase: {connection?.database || ''}</p>
      <br />
    </Modal>
  );
};

export default ConnectionSuccessModal;
