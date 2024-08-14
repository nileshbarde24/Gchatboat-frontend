import React, { useState, useEffect } from 'react';
import { Alert, Button, Dropdown, Input, Menu, Modal, Progress, Spin, message } from 'antd';
import './chat.css';
import axios from 'axios';
import { Config } from '../config';
import { UserOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Avatar, Space } from 'antd';
import ChatGPTIcon from '../assets/chatgpt-icon.png';
import { apiGET, apiPOST } from '../utils/apiHelper';
import { useParams, useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import { PlusOutlined } from '@ant-design/icons';
import EditTopicNameModal from '../modals/EditTopicNameModal';
import DeleteTopicNameModal from '../modals/DeleteTopicNameModal';
const { Search } = Input;
import { v4 as uuidv4 } from 'uuid';
import { formatText, truncateString } from '../utils/stringFormat';
import { sleep } from '../utils/sleep';

const DocChat = () => {
  const param = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const fileName = location?.state?.fileName?.uploaded_file;

  const [streamingId, setStreamingId] = useState(null);
  const [lastMessage, setLastMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);

  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);

  // State to track whether the topic has been entered or not
  const [topicEntered, setTopicEntered] = useState(false);
  // State to store the entered topic
  const [topic, setTopic] = useState('');

  //state topic history
  const [topicsHistory, setTopicsHistory] = useState();

  //show regular or topic chats
  const [showRegularChat, setShowRegularChat] = useState(true);
  const [slectedTopicName, setSelectedTopicName] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState();
  const [selectedItem, setSelectedItem] = useState(null);

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

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const selectTopicHistory = (selctedTopicData) => {
    setSelectedItem(selctedTopicData);
    setShowRegularChat(false);
    const userId = selctedTopicData?.userId;
    const uploadedFileId = selctedTopicData?.uploadedFileId;
    const topicName = selctedTopicData?.topicName;
    const chooseTopicId = selctedTopicData?._id;
    setSelectedTopicId(chooseTopicId);
    setSelectedTopicName(topicName);
    getPerticularPdfChat(userId, uploadedFileId, chooseTopicId);
  };

  const getAnswer = async (query) => {
    setIsLoading(true);
    let interval;
    try {
      interval = setInterval(() => {
        // Increment percentage by 1 every 4 seconds
        setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
      }, 1000);
      /** STREAMING DATA START **/
      const accessToken = localStorage.getItem('access_token');
      const reqBody = {
        query,
        uploadedFileIdz: [param.id],
        topicId: selectedTopicId,
      };

      const response = await fetch(`${Config.API_URL}/api/selected-files/start-conversation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(reqBody),
      });

      console.log('DocChat - Single File response status:::: ', response.status);

      if (response.status === 401) {
        message.error('Session expired! Please login again');
        await sleep(500);
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        return;
      }

      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`Request failed with status: ${response.status}`);
      }

      // Stream response
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
      /** STREAMING DATA END **/
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
      getPdfFileChatHistoryById();
      getPerticularPdfChat(loginUserData?._id, param?.id, selectedTopicId);
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
      uploadedFileId: param?.id,
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

  const getPerticularPdfChat = async (userId, uploadedFileId, chooseTopicId) => {
    setHistoryLoading(true);
    try {
      const payload = {
        userId: userId,
        uploadedFileIds: [uploadedFileId],
        topicId: chooseTopicId,
      };
      const chatRes = await apiPOST(`/api/get-perticular-pdf-chat`, payload);
      if (chatRes?.status === 200) {
        let data = chatRes?.data?.data;
        const qaPairs = [];

        for (const key in data) {
          if (data.hasOwnProperty(key)) {
            const qaPair = data[key];
            qaPairs.push(qaPair);
          }
        }

        // setPerticularPdfChats(chatRes?.data?.data);
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

  const getPdfFileChatHistoryById = async () => {
    try {
      const chatHistoryRes = await apiGET(`/api/get-pdf-chat-history/${param?.id}`);
      if (chatHistoryRes?.status === 200) {
        setTopicsHistory(chatHistoryRes?.data?.data);
      } else {
        console.log('Something went wrong');
        setTopicsHistory(null);
      }
    } catch (error) {
      console.log(error);
    }
  };

  function scrollDivToEnd() {
    var scrollingDiv = document.getElementById('scrollingDiv');

    // Check if the scrollingDiv element exists
    if (!scrollingDiv) {
      console.error("Element with ID 'scrollingDiv' not found.");
      return;
    }

    var totalHeight = scrollingDiv.scrollHeight;
    var currentPosition = scrollingDiv.scrollTop;

    function scroll() {
      // Check if scrollingDiv is still present (it might have been removed from the DOM)
      if (scrollingDiv) {
        scrollingDiv.scrollTop = currentPosition;
      }

      currentPosition += 20;
      if (currentPosition < totalHeight && scrollingDiv) {
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
    getPdfFileChatHistoryById();
  };

  const closeDeleteTopicModal = () => {
    setShowDeleteTopicModal(false);
    setShowDeleteTopicData(null);
    getPdfFileChatHistoryById();
  };

  useEffect(() => {
    getPdfFileChatHistoryById();
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
      <div className='flex text-center items-center gap-2 my-4 text-lg'>
        <div>You're chatting about the file:</div>
        <Alert message={` ${fileName}`} type='info' showIcon />
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
            <div className='font-semibold text-center'>New chat</div>
            <PlusOutlined />
          </div>
          <div className='text-gray-200 p-2  text-sm'>Recent history:</div>
          <div className='p-1 flex flex-col gap-1  h-[420px] overflow-auto scrollbar-hide'>
            <Menu
              style={{ background: '#40414f', color: 'white' }}
              mode='vertical'
              selectedKeys={selectedItem ? [selectedItem._id] : []}
            >
              {topicsHistory?.map((item) => (
                <Menu.Item key={item._id} className='mb-2'>
                  <div onClick={() => selectTopicHistory(item)} className='flex items-center justify-between'>
                    {/* <span>{item.topicName}</span> */}
                    <span className={`${ selectedItem?._id === item._id?"text-black":"text-white"}`}>{truncateString(item.topicName, 27)}</span>
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
                            className={`text-xl text-white rounded-full ${
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
              <div>
                <div id='scrollingDiv' className='chat-messages h-[450px] mb-16 '>
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
                    <Button disabled={isLoading} style={{color: 'white', border: 'none' ,backgroundColor:"#1677ff" }}>
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

export default DocChat;
