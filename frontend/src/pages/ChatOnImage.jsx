import React, { useState } from 'react';
import { Input, message, Upload, Button, Avatar, Tooltip } from 'antd';
import { UserOutlined, UploadOutlined, CloseCircleOutlined } from '@ant-design/icons';
import './chat.css';
import { apiPOST } from '../utils/apiHelper';

const { Search } = Input;

const ChatOnImage = () => {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // Use an array for multiple files
  const [formData] = useState(new FormData());
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleImageChange = (info) => {
    if (info.file.status === 'done') {
      message.success(`${info.file.name} file uploaded successfully`);
    } else if (info.file.status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  };

  const handleSearch = async () => {
    if (inputValue.trim() === '' && imageFiles.length === 0) return;

    // Create a new message object for the user's question and uploaded images
    const userQuestion = { text: inputValue, type: 'user' };
    const userImages = imageFiles.map((file, index) => ({ file, type: 'image', id: index }));

    // Add the user's question and uploaded images to the messages array
    setMessages([...messages, ...userImages, userQuestion]);

    // Clear input values and uploaded files
    setInputValue('');
    setImageFiles([]);

    setLoading(true);

    // Append new files to the existing FormData
    imageFiles.forEach((file) => {
      // Ensure you append the originFileObj which is the actual file blob
      formData.append('files', file);
    });

    formData.set('query', inputValue);

    for (let [key, value] of formData.entries()) {
      console.log(key, value); // This will log keys and values of formData
    }

    try {
      const response = await apiPOST('/api/analyzeImage/upload', formData);
      console.log(response);
      if (response.status === 200) {
        const answer = response.data.content;
        const dummyAnswer = { text: answer, type: 'gpt' };
        setMessages((prevMessages) => [...prevMessages, dummyAnswer]);
      }
    } catch (error) {
      console.log(error);
      message.error(error);
    } finally {
      setLoading(false);
    }
  };

  // const handleSearch = async () => {
  //   if (inputValue.trim() === '' && imageFiles.length === 0) return;

  //   // Create a new message object for the user's question and uploaded images
  //   const userQuestion = { text: inputValue, type: 'user' };
  //   const userImages = imageFiles.map((file, index) => ({ file, type: 'image', id: index }));

  //   // Add the user's question and uploaded images to the messages array
  //   setMessages([...messages, ...userImages, userQuestion]);

  //   // Clear input values and uploaded files
  //   setInputValue('');
  //   setImageFiles([]);

  //   setLoading(true);

  //   const formData = new FormData();
  //   imageFiles.forEach((file) => {
  //     // Ensure you append the originFileObj which is the actual file blob
  //     formData.append('files', file);
  //   });

  //   formData.append('query', inputValue);

  //   for (let [key, value] of formData.entries()) {
  //     console.log(key, value); // This will log keys and values of formData
  //   }

  //   try {
  //     const response = await apiPOST('/api/analyzeImage/upload', formData);
  //     console.log(response);
  //     if (response.status === 200) {
  //       const answer = response.data.content;
  //       const dummyAnswer = { text: answer, type: 'gpt' };
  //       setMessages((prevMessages) => [...prevMessages, dummyAnswer]);
  //     }
  //   } catch (error) {
  //     console.log(error);
  //     message.error(error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const formateText = (text) => {
    if (text.includes('\n')) {
      const textWithHTMLLineBreaks = text.replace(/\n/g, '<br />');
      return <div dangerouslySetInnerHTML={{ __html: textWithHTMLLineBreaks }} />;
    } else {
      return text;
    }
  };

  const handleRemoveImage = (index) => {
    setImageFiles((prevFiles) => {
      const updatedFiles = [...prevFiles];
      updatedFiles.splice(index, 1);
      return updatedFiles;
    });
  };

  return (
    <div>
      <div className='flex gap-1'>
        <div className='main w-full'>
          <div className='chat-container relative flex flex-col'>
            <div id='scrollingDiv' className={`chat-messages ${imageFiles?.length ? 'h-[60vh]' : 'h-[80vh]'} mb-16 `}>
              {messages.map((message, index) => (
                <div key={index} className={`image-chat-message ${message.type === 'user' ? 'user' : 'gpt'}`}>
                  {message.type === 'user' ? (
                    message.type === 'image' ? (
                      <Avatar size={'large'} style={{ marginRight: 10 }} src={URL.createObjectURL(message.file)} />
                    ) : (
                      <Avatar size={'large'} style={{ marginRight: 10 }} icon={<UserOutlined />} />
                    )
                  ) : null}
                  {message.type === 'image' ? (
                    <img
                      className='w-[20%]  rounded-lg '
                      key={message.id}
                      src={URL.createObjectURL(message.file)}
                      alt={`user-uploaded-${message.id}`}
                    />
                  ) : (
                    formateText(message.text)
                  )}
                </div>
              ))}
            </div>

            <div className=' flex w-full '>
              {imageFiles?.length ? (
                <div className='flex mb-1 pt-2 pr-2 -mr-2 bg-white rounded-lg'>
                  {imageFiles.map((file, index) => (
                    <div className='relative mb-14 ml-3 w-[15%] rounded-lg'>
                      <img
                        className='w-full h-full object-cover rounded-lg'
                        src={URL.createObjectURL(file)}
                        alt={`user-uploaded-${index}`}
                      />
                      <div
                        className='absolute -top-3 -right-1 cursor-pointer text-black hover:text-red-500 text-lg'
                        onClick={() => handleRemoveImage(index)}
                      >
                        <Tooltip title='Remove' key={index}>
                          <CloseCircleOutlined />
                        </Tooltip>
                      </div>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className='chat-input flex items-center absolute w-full  bottom-2'>
                <Search
                  placeholder='Type your query...'
                  enterButton={'Send'}
                  size='large'
                  value={inputValue}
                  onChange={handleInputChange}
                  onSearch={handleSearch}
                  style={{ marginLeft: 10, color: '#ffffff' }}
                  className='custom-search-input bg-blue-500 rounded-lg'
                  loading={loading}
                  prefix={
                    <Upload
                      showUploadList={false}
                      beforeUpload={(file) => {
                        setImageFiles((prevFiles) => [...prevFiles, file]); // Append to the array
                        return false; // Prevent default upload behavior
                      }}
                      onChange={handleImageChange}
                      fileList={imageFiles}
                      multiple={true}
                    >
                      <Button icon={<UploadOutlined />} />
                    </Upload>
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatOnImage;
