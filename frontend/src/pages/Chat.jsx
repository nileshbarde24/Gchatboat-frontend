import React, { useState, useEffect } from 'react';
import { Input, Alert, Modal, Menu, Dropdown, Button, Progress, Tooltip } from 'antd';
import './chat.css';
import { Config } from '../config';
import { UserOutlined, PlusOutlined, EllipsisOutlined } from '@ant-design/icons';
import { Avatar, Space, message } from 'antd';
import { apiGET, apiPOST } from '../utils/apiHelper';
import FileUploadIcon from '../components/FileUploadIcon';
import EditTopicNameModal from '../modals/EditTopicNameModal';
import DeleteTopicNameModal from '../modals/DeleteTopicNameModal';
import { v4 as uuidv4 } from 'uuid';
import { AiOutlineLink } from 'react-icons/ai';
import { FiLink } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import WebUrlModel from '../components/WebUrlModel';
import { formatText, truncateString } from '../utils/stringFormat';
import { sleep } from '../utils/sleep';

const { Search } = Input;

const Chat = () => {
  const navigate = useNavigate();

  // Web URL
  const [webUrlModelVisible, setWebUrlModelVisible] = useState(false);
  const [webUrlLoading, setWebUrlLoading] = useState(false);
  const [webUrl, setWebUrl] = useState('');
  // Web URL

  const [streamingId, setStreamingId] = useState(null);
  const [lastMessage, setLastMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [fileData, setFileData] = useState();
  const [isTopicModalVisible, setIsTopicModalVisible] = useState(false);

  // State to track whether the topic has been entered or not
  const [topicEntered, setTopicEntered] = useState(false);

  // State to store the entered topic
  const [topic, setTopic] = useState('');
  const [selectedTopicId, setSelectedTopicId] = useState();
  const userDataString = localStorage.getItem('user');
  const loginUserData = JSON.parse(userDataString);

  //regular chat
  const [showRegularChat, setShowRegularChat] = useState(true);
  const [slectedTopicName, setSelectedTopicName] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [topicsHistory, setTopicsHistory] = useState();

  // topic action state
  const [optionsVisible, setOptionsVisible] = useState(false);
  const [showEditTopicModal, setShowEditTopicModal] = useState(false);
  const [showEditTopiData, setShowEditTopicData] = useState('');
  const [showDeleteTopicModal, setShowDeleteTopicModal] = useState(false);
  const [showDeleteTopicData, setShowDeleteTopicData] = useState('');

  //progress % for get result time
  const [percentage, setPercentage] = useState(0);

  // console.log('file_____>>>', fileData);
  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };
  const selectTopicHistory = (selctedTopicData) => {
    setSelectedItem(selctedTopicData);
    setShowRegularChat(false);
    setTopicEntered(true);
    const userId = selctedTopicData?.userId;
    const topicName = selctedTopicData?.topicName;
    const chooseTopicId = selctedTopicData?._id;
    setSelectedTopicId(chooseTopicId);
    setSelectedTopicName(topicName);
    getPerticularTopicGlobalChat(userId, chooseTopicId);
  };

  const getAnswer = async (query) => {
    setIsLoading(true);
    let interval;
    const accessToken = localStorage.getItem('access_token');

    if (!query) {
      return message.error('Please enter a query');
    }

    if (!selectedTopicId) {
      return message.error('Please enter a topic name');
    }

    try {
      if (!fileData?.name) {
        interval = setInterval(() => {
          // Increment percentage by 1 every 4 seconds
          setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
        }, 1000);
        /* Streaming Code Start */

        const reqBody = {
          query,
          topicId: selectedTopicId,
        };
        const response = await fetch(`${Config.API_URL}/api/start-conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(reqBody),
        });

        console.log('response status: ', response.status);

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
        let id = uuidv4();
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
          console.log('text: 1#', text);
          setLastMessage((prevText) => prevText + text);
          scrollDivToEnd();
        }

        /* Streaming Code End */
      } else {
        interval = setInterval(() => {
          // Increment percentage by 1 every 4 seconds
          setPercentage((prevPercentage) => (prevPercentage < 100 ? prevPercentage + 1 : 100));
        }, 1000);

        // Streaming Code Start
        if (!fileData?.response?.data?.uploadedFileId) {
          console.log('uploadedFileIdz: ', fileData?.response?.data?.uploadedFileId);
          return message.error('Something went wrong!');
        }

        const reqBody = {
          query,
          uploadedFileIdz: [fileData?.response?.data?.uploadedFileId],
          topicId: selectedTopicId,
        };

        if (!reqBody.uploadedFileIdz) {
          console.log('reqBody: ', reqBody);
          return message.error('Something went wrong');
        }

        const response = await fetch(`${Config.API_URL}/api/selected-files/start-conversation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify(reqBody),
        });

        console.log('response status: ', response.status);

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
        let id = uuidv4();
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
          console.log('text: 1#', text);
          setLastMessage((prevText) => prevText + text);
          scrollDivToEnd();
        }
        // Streaming Code End
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
    console.log('PPPPDSDSDSDDS', topicEntered);
    setLastMessage('');
    setStreamingId('');

    if (!topicEntered) {
      await fetchRelevantSentenceAndAddTopic();
      console.log(inputValue);
      // setIsTopicModalVisible(true);
    } else {
      if (inputValue.trim() === '') return;
      await getAnswer(inputValue);
      getUserChatHistoryById();
      getPerticularTopicGlobalChat(loginUserData?._id, selectedTopicId);
    }
  };

  useEffect(() => {
    if (topicEntered && inputValue) {
      handleSearch();
    }
  }, [topicEntered]);

  // Function to handle the topic modal submission
  const handleTopicSubmit = async () => {
    // Perform any necessary actions with the entered topic
    const topicPayload = {
      topicName: topic,
      userId: loginUserData?._id,
      uploadedFileId: fileData?.response?.data?.uploadedFileId,
      isGlobal: fileData?.response?.data?.uploadedFileId ? false : true,
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
  const fetchRelevantSentenceAndAddTopic = async () => {
    // Perform any necessary actions with the entered topic
    const generateSentencePayload = {
      userInput: inputValue
    };
    try {
      const generatedSentenceRes = await apiPOST(`/api/generate-relevant-sentence`, generateSentencePayload);
      console.log('generatedSentenceRes', generatedSentenceRes);
      if (generatedSentenceRes?.status === 200) {
        const topicPayload = {
          topicName: generatedSentenceRes?.data?.data,
          userId: loginUserData?._id,
          uploadedFileId: fileData?.response?.data?.uploadedFileId,
          isGlobal: fileData?.response?.data?.uploadedFileId ? false : true,
        };
        try {
          const topicRes = await apiPOST(`/api/add-topic`, topicPayload);
          if (topicRes?.status === 200) {
            setSelectedTopicId(topicRes?.data?.data?.insertedId);
            // selectTopicHistory()
            setTopic('');
            setIsTopicModalVisible(false);
            setTopicEntered(true);
          }
        } catch (error) {
          console.log(error);
          message.error('Something went wrong!');
        }
      }
    } catch (error) {
      console.log(error);
      message.error('Something went wrong!');
    }
  };

  const getPerticularTopicGlobalChat = async (userId, chooseTopicId) => {
    try {
      const payload = {
        userId: userId ? userId : loginUserData?._id,
        topicId: chooseTopicId,
        isGlobal: fileData?.response?.data?.uploadedFileId ? false : true,
      };
      const chatRes = await apiPOST(`/api/get-global-chat`, payload);
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
        scrollDivToEnd();
      } else {
      }
    } catch (error) { }
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

  const getUserChatHistoryById = async () => {
    try {
      const chatHistoryRes = await apiGET(`/api/get-topics-chat-global/${loginUserData?._id}`);
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
    getUserChatHistoryById();
  };

  const closeDeleteTopicModal = () => {
    setShowDeleteTopicModal(false);
    setShowDeleteTopicData(null);
    getUserChatHistoryById();
  };

  useEffect(() => {
    getUserChatHistoryById();
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

  // Upload Web URL:
  const handleUploadWebUrl = async () => {
    if (!webUrl) return message.error('Web URL is required!');

    setWebUrlLoading(true);

    try {
      const resp = await apiPOST(`/api/web-scraping`, {
        url: webUrl,
      });

      setFileData({
        name: webUrl,
        response: resp?.data,
      });
      console.log('Uploaded Web url resp: ', resp);
    } catch (error) {
      console.log('handleUploadWebUrl', error);
      message.error('Something went wrong!');
    } finally {
      setWebUrlModelVisible(false);
      setWebUrl('');
      setWebUrlLoading(false);
      setMessages([]);
      setSelectedTopicId(null);
      setTopicEntered(false);
    }
  };

  return (
    <div>
      {fileData?.name ? (
        <div className='flex text-center gap-2 my-2 text-lg items-center'>
          <div className='whitespace-nowrap'>You're chatting about the files:</div>
          <Alert message={` ${fileData?.name}`} type='info' />
        </div>
      ) : null}

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
                            className={`text-xl text-black hover:text-white hover:bg-black rounded-full ${selectedItem?._id === item._id ? 'flex' : 'hidden'
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
                setTopic(null);
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

                    {formatText(message?.text)}
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

            {/* Web Url Model = used to upload website url */}
            <WebUrlModel
              webUrlModelVisible={webUrlModelVisible}
              handleUploadWebUrl={handleUploadWebUrl}
              setWebUrlModelVisible={setWebUrlModelVisible}
              setWebUrl={setWebUrl}
              webUrl={webUrl}
              webUrlLoading={webUrlLoading}
            />
            {/* Web Url Modal */}

            <div className='chat-input flex items-center absolute w-full bottom-2 px-5'>
              {/* <FileUploadIcon setFileData={setFileData}/> */}
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
                    <Button disabled={isLoading} style={{ color: 'white', border: 'none', backgroundColor: "#1677ff" }}>
                      Send
                    </Button>
                  )
                }
                // prefix={<FileUploadIcon setFileData={setFileData} />}
                prefix={
                  <>
                    <FileUploadIcon
                      setFileData={setFileData}
                      setMessages={setMessages}
                      setSelectedTopicId={setSelectedTopicId}
                      setTopicEntered={setTopicEntered}
                    />
                    <Tooltip title='Web Url'>
                      {/* <AiOutlineLink
                        className='text-black text-xl font-bold mr-2 cursor-pointer'
                        onClick={() => setWebUrlModelVisible(true)}
                      /> */}
                      <Button
                        size='middle'
                        icon={<FiLink className='text-black' />}
                        onClick={() => setWebUrlModelVisible(true)}
                        className='mr-2 cursor-pointer'
                      />
                    </Tooltip>
                  </>
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

export default Chat;
