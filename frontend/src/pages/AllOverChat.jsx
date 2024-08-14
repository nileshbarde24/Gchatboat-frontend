import React, { useState } from 'react';
import { Input, message, Upload, Button, Avatar, Tooltip, Dropdown, Menu, Alert, Progress, Modal, Space } from 'antd';
import { UserOutlined, UploadOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import './chat.css';
import AllDocFileUploadIcon from '../components/AllDocFileUploadIcon';
import { apiPOST } from '../utils/apiHelper';

const { Search } = Input;

const AllOverChat = () => {
  const userDataString = localStorage.getItem('user');
  const loginUserData = JSON.parse(userDataString);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [imageFiles, setImageFiles] = useState([]); // Use an array for multiple files
  const [showImageFiles, setShowImageFiles] = useState([]); // Use an array for show top multiple files
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [docsFileData, setDocsFileData] = useState('');
  const [docsLoading, setDocsLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  //progress % for get result time
  const [percentage, setPercentage] = useState(0);
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState();
  // State to track whether the topic has been entered or not
  const [topicEntered, setTopicEntered] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0); // Start from 1

  //imageurl states
  const [isImageUrlModalVisible, setImageUrlModalVisible] = useState(false);
  const [urls, setUrls] = useState(['']); // Array to store URL inputs
  const [question, setQuestion] = useState('');

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

  const getAnswer = async (query) => {
    setIsLoading(true);
    let interval;
    try {
      if (!docsFileData?.name) {
        interval = setInterval(() => {
          // Increment percentage by 1 every 4 seconds
          setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
        }, 1000);
        const response = await apiPOST(`/api/start-conversation`, {
          query,
          topicId: selectedTopicId,
        });
        if (response.status === 200 && response.data?.response) {
          clearInterval(interval);
          setPercentage(0);
          return response.data?.response;
        } else {
          message.error(response?.data?.error?.message || 'Something went wrong');
          clearInterval(interval);
          setPercentage(0);
        }
      } else {
        interval = setInterval(() => {
          // Increment percentage by 1 every 4 seconds
          setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
        }, 1000);
        const response = await apiPOST(`/api/selected-files/start-conversation`, {
          query,
          uploadedFileIdz: [docsFileData?.response?.data?.uploadedFileId],
          topicId: selectedTopicId,
        });

        // return response.data?.text
        if (response.status === 200 && response.data?.response) {
          clearInterval(interval);
          setPercentage(0);
          return response.data?.response;
        } else {
          message.error(response?.data?.error?.message || 'Something went wrong');
          clearInterval(interval);
          setPercentage(0);
        }
      }
    } catch (error) {
      clearInterval(interval);
      setPercentage(0);
      console.log(error);
      message.error(error || 'Something went wrong');
    } finally {
      setIsLoading(false);
      clearInterval(interval);
      setPercentage(0);
    }
  };


  const handleSearch = async () => {

    if (docsFileData?.name) {
      if (!topicEntered) {
        setIsTopicModalVisible(true);
      } else {
        if (inputValue.trim() === '') return;
        // Create a new message object for the user's question and GPT's answer
        const userQuestion = { text: inputValue, type: 'user' };
        const answer = await getAnswer(inputValue);
        console.log({
          answer,
        });

        if (answer) {
          const gptAnswer = { text: answer, type: 'gpt' };

          // Add the user's question and GPT's answer to the messages array
          setMessages([...messages, userQuestion, gptAnswer]);
          setInputValue('');
          scrollDivToEnd()
        }
      }
    } else if(imageFiles?.length>0) {
      console.log("Image payload",{question:inputValue,urls:imageFiles})
      // this for image handle seacrh
      if (inputValue.trim() === '' && imageFiles.length === 0) return;

      // Create a new message object for the user's question and uploaded images
      const userQuestion = { text: inputValue, type: 'user' };
      const userImages = imageFiles.map((file, index) => ({ file, type: 'image', id: index }));

      // Add the user's question and uploaded images to the messages array
      setMessages([...messages, ...userImages, userQuestion]);

      // Clear input values and uploaded files
      setInputValue('');
      setImageFiles([]);

      const formData = new FormData();
      imageFiles.forEach((file) => {
        // Ensure you append the originFileObj which is the actual file blob
        formData.append('files', file);
      });
      formData.append('query', inputValue);

      for (let [key, value] of formData.entries()) {
        console.log(key, value); // This will log keys and values of formData
      }

      console.log("formdata", formData)
      const dummyAnswer = { text: "this is dummy answer", type: 'gpt' };
      setMessages((prevMessages) => [...prevMessages, dummyAnswer]);
      return
      // try {
      //   const response = await apiPOST('/api/analyzeImage/upload', formData);
      //   console.log(response);
      //   if (response.status === 200) {
      //     const answer = response.data.content;
      //     const dummyAnswer = { text: answer, type: 'gpt' };
      //     setMessages((prevMessages) => [...prevMessages, dummyAnswer]);
      //   }
      // } catch (error) {
      //   console.log(error);
      //   message.error(error);
      // } finally {
      // }
    }else{
      // Create a new message object for the user's question and uploaded images
      const userQuestion = { text: question, type: 'user' };
      const userUrls = urls.map((file, index) => ({ file, type: 'url', id: index }));
       console.log("userUrls",userUrls)
      // Add the user's question and uploaded images to the messages array
      setMessages([...messages, ...userUrls, userQuestion]);
      const dummyAnswer = { text: "this is dummy answer", type: 'gpt' };
      setMessages((prevMessages) => [...prevMessages, dummyAnswer]);
      //payload for urls
      console.log('urls payload', { urls: urls, question: question });
      setUrls([''])
      setQuestion(null)
    }

  };




  const handleTopicSubmit = async () => {
    // Perform any necessary actions with the entered topic
    const topicPayload = {
      topicName: topic,
      userId: loginUserData?._id,
      uploadedFileId: docsFileData?.response?.data?.uploadedFileId,
    };

    try {
      const topicRes = await apiPOST(`/api/add-topic`, topicPayload);
      if (topicRes?.status === 200) {
        setSelectedTopicId(topicRes?.data?.data?.insertedId);
        setTopic('');
        setIsTopicModalVisible(false);
        setTopicEntered(true);
      }
    } catch (error) {
      console.log(error);
      message.error('Something went wrong!');
    }
  };


  const formateText = (text) => {
    if (text?.includes('\n')) {
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

  const handleMenuClick = (e) => {
    // Handle menu item click logic here
    console.log('Clicked on', e.key);
    setDropdownVisible(false); // Close the dropdown after clicking an item
  };

  const handleDropdownVisibleChange = (visible) => {
    setDropdownVisible(visible);
  };

  function scrollDivToEnd() {
    var scrollingDiv = document.getElementById('scrollingDiv');
    var totalHeight = scrollingDiv.scrollHeight;
    var currentPosition = scrollingDiv.scrollTop;

    function scroll() {
      scrollingDiv.scrollTop = currentPosition;

      currentPosition += 20;
      if (currentPosition < totalHeight) {
        setTimeout(scroll, 20); // You can adjust the delay (in milliseconds) if needed
      }
    }

    scroll();
  }

  const handleUrlsSubmit = () => {

    // You can close the modal or perform any other actions
    if (!question?.length) return message.info("Please enter question")
    if (!urls[0]) return message.info("Please enter urls")
    if (question?.length && urls[0]) {
      // Handle submission logic here payload
      console.log('Submitted urls', { urls: urls, question: question });
      //close and clear the state
      setImageUrlModalVisible(false);
      setInputValue(question)
     handleSearch()
    }

  };

  const handleAddUrlInput = () => {
    setUrls([...urls, '']);
  };

  const handleRemoveUrlInput = (indexToRemove) => {
    const newUrls = urls.filter((url, index) => index !== indexToRemove);
    setUrls(newUrls);
  };

  //plus icon dropdowns
  const menu = (
    <Menu onClick={handleMenuClick} className='w-[200px]'>
      <Menu.Item key="document"><AllDocFileUploadIcon setDocsFileData={setDocsFileData} setUploadProgress={setUploadProgress} docsLoading={docsLoading} setDocsLoading={setDocsLoading} /></Menu.Item>
      <Menu.Item key="image">
        <Upload
          showUploadList={false}
          beforeUpload={(file) => {
            setImageFiles((prevFiles) => [...prevFiles, file]); // Append to the array
            setShowImageFiles((prevFiles) => [...prevFiles, file]); // Append to the array
            setDocsFileData(null)
            return false; // Prevent default upload behavior
          }}
          onChange={handleImageChange}
          multiple
        >
          <Button icon={<UploadOutlined />}>Upload Image</Button>
        </Upload>
      </Menu.Item>
      <Menu.Item key="image-url">
        <Button icon={<UploadOutlined />} onClick={() => setImageUrlModalVisible(true)}>Image URL</Button>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      {docsFileData?.name ? (
        <div className='flex text-center gap-2 my-2 text-lg items-center'>
          <div className='whitespace-nowrap'>You're chatting about the files:</div>
          <Alert message={` ${docsFileData?.name}`} type='info' />
        </div>
      ) : null}
      {showImageFiles?.length ?
        <div className='whitespace-nowrap flex items-center gap-2 my-2 '>
          <sapn className="font-bold text-lg">You're chatting about the files:</sapn>
          <div className='flex gap-1 w-full overflow-auto scrollbar-hide'>
            {showImageFiles.map((item) => {
              return (
                <Alert message={` ${item?.name}`} type='info' />
              )
            })}
          </div>
        </div> : null}

      <div className='flex gap-1'>
        <div className='main w-full'>
          <div className='chat-container relative flex flex-col' >
            <Modal
              title='Enter Topic'
              visible={isTopicModalVisible}
              onOk={handleTopicSubmit}
              onCancel={() => {
                setIsTopicModalVisible(false);
                setTopic(null);
              }}
              okButtonProps={{ style: { backgroundColor: 'blue', color: 'white' } }}
            >
              <Input placeholder='Enter topic' value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Modal>
            <Modal
              title="Enter Topic"
              visible={isImageUrlModalVisible}
              onOk={handleUrlsSubmit}
              onCancel={() => {
                setImageUrlModalVisible(false);
                setUrls(['']); // Reset URL inputs on cancel
                setQuestion('');
              }}
              okButtonProps={{ style: { backgroundColor: 'blue', color: 'white' } }}
            >
              {/* Question Input */}
              <Input placeholder="Enter question" value={question} onChange={(e) => setQuestion(e.target.value)} />

              {/* Dynamic URL Inputs */}
              {urls.map((url, index) => (
                <Space key={index} style={{ marginTop: '8px' }}>
                  <Input
                    placeholder="Enter URL"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...urls];
                      newUrls[index] = e.target.value;
                      setUrls(newUrls);
                    }}
                  />
                  <Tooltip title="remove urls"><Button type="dashed" icon={<CloseCircleOutlined />} onClick={() => handleRemoveUrlInput(index)} /></Tooltip>
                </Space>
              ))}

              {/* "+" Button to add more URL inputs */}
              <Tooltip title="add urls"><Button type="dashed" icon={<PlusOutlined />} onClick={handleAddUrlInput} className='ml-2' /></Tooltip>
            </Modal>

            <div id='scrollingDiv' className={`chat-messages ${imageFiles?.length ? "h-[60vh]" : "h-[80vh]"} mb-16 `} >
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
                    <img className='w-[20%]  rounded-lg ' key={message.id} src={URL.createObjectURL(message.file)} alt={`user-uploaded-${message.id}`} />
                  ) : (
                    formateText(message.text)
                  )}
                  {message.type === 'url' ? (
                    <img className='w-[20%]  rounded-lg ' key={message.id} src={message.file} alt={`user-uploaded-${message.id}`} />
                  ) : (
                    formateText(message.text)
                  )}
                </div>
              ))}
            </div>
            {docsLoading ?
              <Progress
                percent={uploadProgress}
                status='active'
                type='circle'
                width={100}
                strokeColor={uploadProgress === 100 ? 'green' : ''}
                className='absolute bottom-60 left-72'
                format={() => (
                  <div className='text-white'>
                    {uploadProgress === 100 ? <div className='text-sm'>Completed</div> : uploadProgress + '%'}
                  </div>
                )}
              /> : null}

            <div className=' flex w-full '>
              {imageFiles?.length ?
                <div className='flex mb-1 pt-2 pr-2 -mr-2 bg-white rounded-lg'>
                  {imageFiles.map((file, index) => (
                    <div className='relative mb-14 ml-3 w-[15%] rounded-lg'>
                      <img className='w-full h-full object-cover rounded-lg' src={URL.createObjectURL(file)} alt={`user-uploaded-${index}`} />
                      <div className='absolute -top-3 -right-1 cursor-pointer text-black hover:text-red-500 text-lg' onClick={() => handleRemoveImage(index)}>
                        <Tooltip title="Remove" key={index}><CloseCircleOutlined /></Tooltip>
                      </div>
                    </div>

                  ))}
                </div> : null}

              <div className='chat-input flex items-center absolute w-full bottom-2'>
                <Dropdown
                  overlay={menu}
                  placement="topCenter"
                  visible={dropdownVisible}
                  onVisibleChange={handleDropdownVisibleChange}
                >
                  <Search
                    placeholder='Type your query...'
                    enterButton={isLoading ? (
                      <Progress
                        percent={percentage}
                        status='active'
                        type='circle'
                        width={30}
                        strokeColor={percentage === 100 ? 'green' : 'white'}
                        format={() => (
                          <div className='text-white cursor-not-allowed'>
                            {percentage === 100 ? <div className='text-sm'>Completed</div> : percentage + '%'}
                          </div>
                        )}
                      />
                    ) : (
                      <Button disabled={isLoading} style={{ color: 'white', border: 'none' }}>
                        Send
                      </Button>
                    )}
                    size='large'
                    value={inputValue}
                    onChange={handleInputChange}
                    onSearch={handleSearch}
                    style={{ marginLeft: 10, color: '#ffffff' }}
                    className='custom-search-input bg-blue-500 rounded-lg'
                    prefix={<PlusOutlined className={`text-black text-xl font-bold ${dropdownVisible ? "rotate-[225deg] duration-700" : "rotate-0 duration-700"}`} onClick={() => setDropdownVisible(!dropdownVisible)} />
                    }
                  />
                </Dropdown>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllOverChat;
