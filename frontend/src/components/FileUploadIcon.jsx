import React, { useState } from 'react';
import { Upload, Button, Progress, message, Tooltip } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { Config } from '../config';
import { useNavigate } from 'react-router-dom';

const FileUploadIcon = ({ setFileData, setMessages, setSelectedTopicId, setTopicEntered }) => {
  const navigate = useNavigate();
  const accessToken = localStorage.getItem('access_token');
  const allowedFileTypes = [
    '.pdf',
    '.docx',
    '.doc',
    '.csv',
    '.xlsx',
    '.xls',
    '.jpg',
    '.pptx',
    '.mp3',
    '.wav',
    '.mp4',
    '.txt',
  ];

  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Start from 1
  function beforeUpload(file) {
    setMessages([]);
    setSelectedTopicId(null);
    setFileData(null);
    setTopicEntered(false);

    const fileType = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();

    if (!allowedFileTypes.includes(fileType)) {
      message.error('File type not supported!');
      return false; // Prevent the file from being uploaded
    }

    // setLoading(true); // Set loading to true when upload starts
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
        setLoading(false);
        clearTimeout(timeoutId);
        setUploadProgress(null);
      } else {
        const fileType = info.file.name.slice(info.file.name.lastIndexOf('.')).toLowerCase();
        if (!response?.message && allowedFileTypes.includes(fileType)) {
          setLoading(true);
          handleIncrement();
        } else if (response?.message) {
          message.success(`${info.file.name} file uploaded successfully.`);
          setUploadProgress(null);
          clearTimeout(timeoutId);
          setLoading(false);
          setFileData(info?.file);
        } else if (status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
          clearTimeout(timeoutId);
          setUploadProgress(null);
          setLoading(false);
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
        <Upload {...props} accept={allowedFileTypes.join(',')} showUploadList={false} disabled={loading}>
          {loading ? (
            <Progress
              percent={uploadProgress}
              status='active'
              type='circle'
              width={100}
              strokeColor={uploadProgress === 100 ? 'green' : ''}
              className='absolute -top-64 left-72'
              format={() => (
                <div className='text-white'>
                  {uploadProgress === 100 ? <div className='text-sm'>Completed</div> : uploadProgress + '%'}
                </div>
              )}
            />
          ) : (
            <Tooltip title='Upload'>
              <Button size='middle' icon={<UploadOutlined className='text-black' />} disabled={loading} />
            </Tooltip>
          )}
        </Upload>
      </div>
    </div>
  );
};

export default FileUploadIcon;
