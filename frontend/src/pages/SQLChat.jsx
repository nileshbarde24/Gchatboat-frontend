import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { formatText } from '../utils/stringFormat';
import { UserOutlined } from '@ant-design/icons';
import { Avatar, Space, message, Input, Button, Alert } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { apiPOST } from '../utils/apiHelper';
import { Config } from '../config';
const { Search } = Input;

const SQLChat = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const receivedData = location?.state;
  // console.log('receivedData::: ', receivedData);

  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingId, setStreamingId] = useState(null);
  const [lastMessage, setLastMessage] = useState('');

  const [dbName, setDbName] = useState('');

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

  async function getAnswer(question) {
    if (!id || !question) return message.error('Invalid parameters');

    try {
      const accessToken = localStorage.getItem('access_token');
      const response = await fetch(`${Config.API_URL}/api/chat-with-sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          connectionId: id,
          question,
        }),
      });

      console.log('response: ', response.status);

      if (response.status === 401) {
        message.error('Session expired! Please login again');
        localStorage.clear();
        sessionStorage.clear();
        navigate('/login');
        return;
      }

      if (!response.ok) {
        message.error('Something went wrong');
        throw new Error(`Request failed with status: ${response.status}`);
      }

      if (!response.body) throw new Error('No response body');

      const reader = response.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        const text = new TextDecoder('utf-8').decode(value);
        // console.log('text: 1#', text);
        setLastMessage((prevText) => prevText + text);
        scrollDivToEnd();
      }
    } catch (error) {
      console.log('getAnswer: ', error);
      message.error('Something went wrong!');
    }
  }

  const handleSearch = async () => {
    setLastMessage('');
    setStreamingId('');

    if (inputValue.trim() === '') return;

    setIsLoading(true);

    let id = uuidv4();
    setStreamingId(id);

    const userQuestion = {
      qaPairID: id,
      text: inputValue,
      type: 'question',
    };

    const gptAnswer = {
      qaPairID: id,
      text: '',
      type: 'answer',
    };

    setMessages([...messages, userQuestion, gptAnswer]);
    setInputValue('');
    scrollDivToEnd();
    await getAnswer(inputValue);

    setIsLoading(false);
  };

  useEffect(() => {
    if (streamingId) {
      setMessages((prevMessages) => {
        const updatedMessages = Array.isArray(prevMessages)
          ? prevMessages.map((item) => {
              if (item.qaPairID === streamingId && item.type === 'answer') {
                return { ...item, text: lastMessage };
              }
              return item;
            })
          : [];

        // console.log('updatedMessages: ', updatedMessages);
        return updatedMessages;
      });
    }
  }, [lastMessage, streamingId, setMessages]);

  useEffect(() => {
    if (receivedData) {
      setDbName(receivedData?.database);
    }
  }, [receivedData]);

  async function getDbHistory() {
    try {
      const response = await apiPOST('/api/sql-history', {
        connectionId: id,
      });

      if (response.status === 200 && response.data.isSuccess) {
        // console.log('Response Data: ', response.data.data);
        setMessages(response.data.data);
        scrollDivToEnd();
      }

      if (response.status !== 200 || response.data.isSuccess === false) {
        console.log('Get DB History response', response);
        return messages.error('Something went wrong');
      }
    } catch (error) {
      console.log(error);
      message.error('Something went wrong!');
    }
  }

  useEffect(() => {
    getDbHistory();
  }, []);

  return (
    <>
      <div className='mb-4 flex justify-start items-center gap-2'>
        <span className='text-base'>Database:</span>
        <Alert className=' w-72' message={dbName || ''} type='info' showIcon />
      </div>

      <div className='main w-full'>
        <div className='chat-container relative' style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>
          <div id='scrollingDiv' className='chat-messages  overflow-auto scrollbar-hide mb-16'>
            {/* {messages.map((message, index) => (
              <div key={index} className={`chat-message ${message.type === 'question' ? 'question' : 'answer'}`}>
                {message.type === 'question' ? (
                  <Avatar size={'large'} style={{ marginRight: 10 }} icon={<UserOutlined />} />
                ) : null}

                {formatText(message?.text)}
              </div>
            ))} */}
            {messages?.length > 1 &&
              messages.map((qaPair) => {
                if (qaPair.type === 'question') {
                  const correspondingAnswer = messages.find(
                    (answer) => answer.type === 'answer' && answer.qaPairID === qaPair.qaPairID
                  );

                  return (
                    <div key={qaPair._id}>
                      <div className={`chat-message ${qaPair.type === 'question' ? 'question' : 'answer'}`}>
                        <Avatar size={'large'} style={{ marginRight: 10 }} icon={<UserOutlined />} />
                        {qaPair.text}
                      </div>
                      {correspondingAnswer && (
                        <div className='chat-message answer'>{formatText(correspondingAnswer.text)}</div>
                      )}
                    </div>
                  );
                }
                return null;
              })}
          </div>

          <div className='chat-input flex items-center absolute w-full bottom-2 px-3'>
            <Search
              placeholder='Type your query...'
              enterButton={
                <Button loading={isLoading} style={{ color: 'white', border: 'none' }}>
                  Send
                </Button>
              }
              size='large'
              style={{
                color: '#ffffff',
              }}
              value={inputValue}
              onSearch={handleSearch}
              onChange={(e) => setInputValue(e.target.value)}
              className='custom-search-input bg-blue-500 rounded-lg'
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default SQLChat;
