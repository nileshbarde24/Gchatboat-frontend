import React, { useState } from 'react';
import { Upload, Button, Progress, message, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Config } from '../config';
import { useNavigate } from 'react-router-dom';

const AllDocFileUploadIcon = ({setDocsFileData,setUploadProgress,docsLoading,setDocsLoading }) => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');
  const allowedFileTypes = ['.pdf', '.docx', '.doc', '.csv', '.xlsx', '.xls', '.jpg'];

  
  function beforeUpload(file) {
    const fileType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedFileTypes.includes(fileType)) {
      message.error('File type not supported!');
      return false; // Prevent the file from being uploaded
    }

    // setLoading(true); // Set docsLoading to true when upload starts
    return true; // Allow the file to be uploaded
  }
  let timeoutId;

  function handleIncrement() {
    // Increment upload progress by 1
    setUploadProgress((prevProgress) => {
      const newProgress = prevProgress + 1;
      const limitedProgress = Math.min(newProgress, 100);
      if (limitedProgress < 100) {
        timeoutId = setTimeout(handleIncrement, 4000);
      }

      return limitedProgress;
    });
  }

  const props = {
    name: 'file',
    multiple: false,
    action: `${Config.API_URL}/api/upload`,
    // action: `${Config.API_URL}/upload`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    beforeUpload,
    onChange(info) {
      const { status, percent, response } = info.file;
      console.log('percent', percent, status);
      console.log('response', response?.message);
      console.log('info.file', info);
      if (status === 'error') {
        message.error('Some thing went wrong');
        setDocsLoading(false);
        clearTimeout(timeoutId);
        setUploadProgress(null);
      } else {
        const fileType = info.file.name.slice(info.file.name.lastIndexOf('.')).toLowerCase();
        if (!response?.message && allowedFileTypes.includes(fileType)) {
          setDocsLoading(true);
          handleIncrement();
        } else if (response?.message) {
          message.success(`${info.file.name} file uploaded successfully.`);
          setUploadProgress(null);
          clearTimeout(timeoutId);
          setDocsLoading(false);
          setDocsFileData(info?.file);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
          clearTimeout(timeoutId);
          setUploadProgress(null);
          setDocsLoading(false);
        }
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
  };

  return (
    <div>
      <div>
        <Upload {...props} accept={allowedFileTypes.join(',')} showUploadList={false} disabled={docsLoading}>
                <Button className='text-black'  icon={<UploadOutlined />} disabled={docsLoading} >Upload Doc</Button>
        </Upload>
      </div>
    </div>
  );
};

export default AllDocFileUploadIcon;
