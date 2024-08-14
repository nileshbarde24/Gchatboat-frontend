import React from 'react';
import { Input, Modal } from 'antd';

function WebUrlModel({
  webUrlModelVisible,
  handleUploadWebUrl,
  setWebUrlModelVisible,
  setWebUrl,
  webUrl,
  webUrlLoading,
}) {
  return (
    <Modal
      title='Add Web Url'
      visible={webUrlModelVisible}
      onOk={handleUploadWebUrl}
      onCancel={() => {
        setWebUrlModelVisible(false);
        setWebUrl('');
      }}
      okButtonProps={{
        style: { backgroundColor: 'blue', color: 'white' },
        loading: webUrlLoading,
      }}
      confirmLoading={true}
    >
      <div style={{ marginBottom: 24 }}>
        <Input placeholder='Enter Web url' value={webUrl} onChange={(e) => setWebUrl(e.target.value)} />
      </div>
    </Modal>
  );
}

export default WebUrlModel;
