import React, { useState, useEffect } from 'react';
import { Input, Alert, Modal, Menu, Spin, Progress, Button, Dropdown } from 'antd';
import './chat.css';
import axios from 'axios';
import { Config } from '../config';
import { UserOutlined, PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Avatar, Space, message } from 'antd';
import ChatGPTIcon from '../assets/chatgpt-icon.png';
import { apiPOST } from '../utils/apiHelper';
import { useLocation, useNavigate } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import EditTopicNameModal from '../modals/EditTopicNameModal';
import DeleteTopicNameModal from '../modals/DeleteTopicNameModal';
import { v4 as uuidv4 } from 'uuid';
import { formatText, truncateString } from '../utils/stringFormat';
import { sleep } from '../utils/sleep';

const { Search } = Input;

const SelectedFileChat = () => {
  const navigate = useNavigate();

  const [streamingId, setStreamingId] = useState(null);
  const [lastMessage, setLastMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const location = useLocation();
  const selectedFileData = location?.state;
  //for topic model
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);
  const [topicEntered, setTopicEntered] = useState(false);
  const [topic, setTopic] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState();
  //state topic history
  const [topicsHistory, setTopicsHistory] = useState();
  const [slectedTopicName, setSelectedTopicName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [showRegularChat, setShowRegularChat] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [multipleUploadedFileIds, setMultipleUploadedFileIds] = useState();

  // topic action state
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [showEditTopiData, setShowEditTopicData] = useState('');
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [showDeleteTopicData, setShowDeleteTopicData] = useState('');

  //progress % for get result time
  const [percentage, setPercentage] = useState(0);

  const userDataString = localStorage.getItem('user');
  const loginUserData = JSON.parse(userDataString);
  const uploadedFileIdz = location?.state && location.state?.data;

  // console.log('receivedData: ', uploadedFileIdz);

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const selectTopicHistory = (selctedTopicData) => {
    setSelectedItem(selctedTopicData);
    setShowRegularChat(false);
    const userId = selctedTopicData?.userId;
    const uploadedFileIds = selctedTopicData?.uploadedFileIds;
    const topicName = selctedTopicData?.topicName;
    const chooseTopicId = selctedTopicData?._id;
    setSelectedTopicId(chooseTopicId);
    setSelectedTopicName(topicName);
    setMultipleUploadedFileIds(uploadedFileIds);
    console.log('selectTopicHistory: ', uploadedFileIds);
    getMultiplePdfChat(userId, uploadedFileIds, chooseTopicId);
  };

  const getAnswer = async (query) => {
    setIsLoading(true);
    let interval;
    try {
      interval = setInterval(() => {
        setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
      }, 1000);
      /* Streaming Code Start */
      const requestBody = {
        query,
        uploadedFileIdz,
        topicId: selectedTopicId,
      };

      const accessToken = localStorage.getItem('access_token');

      const response = await fetch(`${Config.API_URL}/api/selected-files/start-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set content type to JSON
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody), // Convert the object to JSON
      });

      console.log('multiple file response:::: ', response);

      if (response.status === 401) {
        message.error('Session expired! Please login again');
        await sleep(500);
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');
      const reader = response.body.getReader();
      let id = uuidv4(); // Initialize messageId
      console.log('Identifier ********* ', id);
      setStreamingId(id);
      const userQuestion = { id: id, text: query, type: 'question' }; // Initialize outside the loop
      let gptAnswer = { id: id, text: '', type: 'answer' };
      setMessages([...messages, userQuestion, gptAnswer]);
      setInputValue('');

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          setPercentage(0);
          clearInterval(interval);
          break;
        }
        const text = new TextDecoder('utf-8').decode(value);
        console.log('text: ', text);
        setLastMessage((prevText) => prevText + text);
        scrollDivToEnd();
      }
    } catch (error) {
      message.error('Something went wrong');
      console.log(error);
    } finally {
      setIsLoading(false);
      clearInterval(interval);
      setPercentage(0);
    }
  };

  const handleSearch = async () => {
    setLastMessage('');
    setStreamingId('');

    if (!slectedTopicName && !topicEntered) {
      setIsTopicModalVisible(true);
    } else {
      if (inputValue.trim() === '') return;

      await getAnswer(inputValue);
      getMultiplePdfFileChatHistoryByIds();
      // getMultiplePdfChat(loginUserData?._id, multipleUploadedFileIds, selectedTopicId);
      console.log('handleSearch', uploadedFileIdz);
      getMultiplePdfChat(loginUserData?._id, uploadedFileIdz, selectedTopicId);
    }
  };

  useEffect(() => {
    if (topicEntered && inputValue) {
      handleSearch();
    }
  }, [topicEntered]);

  const handleTopicSubmit = async () => {
    // Perform any necessary actions with the entered topic
    const topicPayload = {
      topicName: topic,
      userId: loginUserData?._id,
      uploadedFileId: uploadedFileIdz,
      isGlobal: uploadedFileIdz ? false : true,
    };
    try {
      const multipleTopicRes = await apiPOST(`/api/add-topic-multiple-file`, topicPayload);
      if (multipleTopicRes?.status === 200) {
        setSelectedTopicId(multipleTopicRes?.data?.data?.insertedId);
        setTopic('');
        setIsTopicModalVisible(false);
        setTopicEntered(true);
      }
    } catch (error) {
      console.log(error);
      message.error('Something went wrong!');
    }
  };

  const getMultiplePdfFileChatHistoryByIds = async () => {
    try {
      const payload = {
        uploadedFileIds: uploadedFileIdz,
      };
      const chatHistoryRes = await apiPOST(`/api/get-multiple-pdf-chat-history`, payload);
      if (chatHistoryRes?.status === 200) {
        setTopicsHistory(chatHistoryRes?.data?.data);
      } else {
        console.log('Something went wrong');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getMultiplePdfChat = async (userId, uploadedFileIds, chooseTopicId) => {
    console.log('getMultiplePdfChat uploadedFileIds: ', uploadedFileIds);
    setHistoryLoading(true);
    try {
      const payload = {
        userId: userId,
        // uploadedFileIds: [uploadedFileIds],
        uploadedFileIds: uploadedFileIds,
        topicId: chooseTopicId,
      };
      const chatRes = await apiPOST(`/api/get-multiple-pdf-chat`, payload);
      if (chatRes?.status === 200) {
        let data = chatRes?.data?.data;
        const qaPairs = [];

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const qaPair = data[key];
            qaPairs.push(qaPair);
          }
        }

        // setMultiplePdfChats(chatRes?.data?.data);
        setMessages(qaPairs);
        setHistoryLoading(false);
        scrollDivToEnd();
      } else {
        setHistoryLoading(false);
      }
    } catch (error) {
      setHistoryLoading(false);
    }
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

  const handleEditTopicVisibleChange = (visible, item) => {
    setOptionsVisible(visible);
    setSelectedItem(visible ? item : null);
  };

  const renderOptions = (item) => (
    <Menu>
      <Menu.Item onClick={() => handleRename(item)}>Rename</Menu.Item>
      <Menu.Item onClick={() => handleDelete(item)}>Delete</Menu.Item>
    </Menu>
  );

  const handleRename = (item) => {
    // Implement logic for renaming
    console.log('Rename clicked for', item);
    setOptionsVisible(null);
    setShowEditTopicData(item);
    setShowEditTopicModal(true);
  };

  const handleDelete = (item) => {
    // Implement logic for deleting
    console.log('Delete clicked for', item);
    setOptionsVisible(null);
    setShowDeleteTopicData(item);
    setShowDeleteTopicModal(true);
  };

  const closeEditTopicModal = () => {
    setShowEditTopicModal(false);
    setShowEditTopicData(null);
    getMultiplePdfFileChatHistoryByIds();
  };

  const closeDeleteTopicModal = () => {
    setShowDeleteTopicModal(false);
    setShowDeleteTopicData(null);
    getMultiplePdfFileChatHistoryByIds();
  };

  useEffect(() => {
    getMultiplePdfFileChatHistoryByIds();
  }, []);

  useEffect(() => {
    if (streamingId) {
      setMessages((prevMessages) => {
        const updatedMessages = Array.isArray(prevMessages)
          ? prevMessages.map((item) => {
              if (item.id === streamingId && item.type === 'answer') {
                return { ...item, text: lastMessage };
              }
              return item;
            })
          : [];

        console.log('updatedMessages: ', updatedMessages);
        return updatedMessages;
      });
    }
  }, [lastMessage, streamingId, setMessages]);

  return (
    <div>
      <div className='flex text-center gap-2 my-4 text-lg items-center'>
        <div className='whitespace-nowrap'>You're chatting about the files:</div>
        <div className='flex gap-2 whitespace-nowrap  scrollbar-hide w-full overflow-auto'>
          {selectedFileData?.fileName?.length &&
            selectedFileData?.fileName?.map((item) => {
              return <Alert message={` ${item}`} type='info' />;
            })}
        </div>
      </div>
      <div className='flex gap-1'>
        <div className='main w-[280px]'>
          <div
            onClick={() => {
              setShowRegularChat(true);
              setSelectedItem(null);
              setSelectedTopicName('');
              setTopicEntered(false);
              setMessages([]);
            }}
            className=' flex justify-between text-gray-200 p-2  font-semibold text-lg cursor-pointer hover:bg-slate-800 rounded-t-lg'
          >
            <div className='font-semibold'>New chat</div>
            <PlusOutlined />
          </div>
          <div className='text-gray-200 p-2  text-sm'>Recent history:</div>
          <div className='p-1 flex flex-col gap-1 text-white h-[420px] overflow-auto scrollbar-hide'>
            <Menu
              style={{ background: '#40414f', color: 'white' }}
              mode='vertical'
              selectedKeys={selectedItem ? [selectedItem._id] : []}
            >
              {topicsHistory?.map((item) => (
                <Menu.Item key={item._id} className='mb-2'>
                  <div onClick={() => selectTopicHistory(item)} className='flex items-center justify-between'>
                    {/* <span>{item.topicName}</span> */}
                    <span>{truncateString(item.topicName, 27)}</span>
                    <Dropdown
                      overlay={renderOptions(item)}
                      trigger={['click']}
                      visible={optionsVisible && selectedItem?._id === item._id}
                      onVisibleChange={(visible) => handleEditTopicVisibleChange(visible, item)}
                    >
                      <Button
                        type='text'
                        shape='circle'
                        icon={
                          <EllipsisOutlined
                            className={`text-xl text-black hover:text-white hover:bg-black rounded-full ${
                              selectedItem?._id === item._id ? 'flex' : 'hidden'
                            }`}
                          />
                        }
                      />
                    </Dropdown>
                  </div>
                </Menu.Item>
              ))}
            </Menu>
            {topicsHistory?.length === 0 && <div className='text-xs'>No recent history found</div>}
          </div>
        </div>
        <div className='main w-full'>
          <div className='chat-container relative' style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
            <Modal
              title='Enter Topic'
              visible={isTopicModalVisible}
              onOk={handleTopicSubmit}
              onCancel={() => {
                setIsTopicModalVisible(false);
                setTopic('');
              }}
              okButtonProps={{ style: { backgroundColor: 'blue', color: 'white' } }}
            >
              <Input placeholder='Enter topic' value={topic} onChange={(e) => setTopic(e.target.value)} />
            </Modal>
            {showRegularChat ? (
              <div id='scrollingDiv' className='chat-messages  overflow-auto scrollbar-hide mb-16'>
                {messages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.type === 'question' ? 'question' : 'answer'}`}>
                    {message.type === 'question' ? (
                      <Avatar size={'large'} style={{ marginRight: 10 }} icon={<UserOutlined />} />
                    ) : null}

                    {formatText(message.text)}
                  </div>
                ))}
              </div>
            ) : null}

            {!showRegularChat ? (
              <div style={{ flex: 1 }}>
                <div id='scrollingDiv' className='chat-messages h-[450px]'>
                  {
                    messages?.length > 1
                      ? messages?.length &&
                        messages?.map((qaPair) =>
                          qaPair.type === 'question' ? (
                            <div key={qaPair._id}>
                              <div className={`chat-message ${qaPair.type === 'question' ? 'question' : 'answer'}`}>
                                <Avatar size={'large'} style={{ marginRight: 10 }} icon={<UserOutlined />} />
                                {qaPair.text}
                              </div>
                              {messages.find(
                                (answer) => answer.type === 'answer' && answer.qaPairID === qaPair.qaPairID
                              ) && (
                                <div className='chat-message answer'>
                                  {formatText(
                                    messages.find(
                                      (answer) => answer.type === 'answer' && answer.qaPairID === qaPair.qaPairID
                                    ).text
                                  )}
                                </div>
                              )}
                            </div>
                          ) : null
                        )
                      : null
                    // <div className='flex justify-center items-center h-screen text-white text-lg'>Let's start chat</div>
                  }
                </div>
              </div>
            ) : null}

            <div className='chat-input absolute w-full bottom-2 px-5'>
              <Search
                placeholder='Type your query...'
                enterButton={
                  isLoading ? (
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
                  )
                }
                size='large'
                value={inputValue}
                onChange={handleInputChange}
                onSearch={!isLoading ? handleSearch : null}
                // loading={isLoading}
                style={{
                  color: '#ffffff',
                }}
                className='custom-search-input bg-blue-500 rounded-lg'
              />
            </div>
            {showEditTopicModal ? (
              <EditTopicNameModal
                showEditTopicModal={showEditTopicModal}
                closeEditTopicModal={closeEditTopicModal}
                showEditTopiData={showEditTopiData}
              />
            ) : null}
            {showDeleteTopicModal ? (
              <DeleteTopicNameModal
                showDeleteTopicModal={showDeleteTopicModal}
                closeDeleteTopicModal={closeDeleteTopicModal}
                showDeleteTopicData={showDeleteTopicData}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SelectedFileChat;
