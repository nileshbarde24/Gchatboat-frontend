import React, { useState, useEffect } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
const { Dragger } = Upload;
import { Config } from '../config';
import { useNavigate } from 'react-router-dom';
const FileUpload = () => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');

  const allowedFileTypes = ['.pdf', '.docx', 'doc'];

  function beforeUpload(file) {
    const fileType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedFileTypes.includes(fileType)) {
      message.error('You can only upload PDF and DOCX files!');
      return false; // Prevent the file from being uploaded
    }

    return true; // Allow the file to be uploaded
  }

  const props = {
    name: 'file',
    multiple: false,
    action: `${Config.API_URL}/upload`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    onChange(info) {
      const { status } = info.file;

      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {
        message.success(`${info.file.name} file uploaded successfully.`);
        navigate('/chat');
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', overflow: 'hidden' }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 600,
        }}
      >
        <Dragger {...props} beforeUpload={beforeUpload} accept={allowedFileTypes.join(',')}>
          <p className='ant-upload-drag-icon'>
            <InboxOutlined />
          </p>
          <p className='ant-upload-text'>Click or drag file to this area to upload</p>
          <p className='ant-upload-hint'>
            Support for a single upload. Strictly prohibited from uploading company data or other banned files.
          </p>
        </Dragger>
      </div>
    </div>
  );
};

export default FileUpload;
