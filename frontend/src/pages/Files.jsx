import { Space, Table, Tag, Typography, message, Button, Modal } from 'antd';
import { useEffect, useState } from 'react';
import { apiPOST, apiPUT } from '../utils/apiHelper';
import { useNavigate } from 'react-router-dom';
import Search from 'antd/es/input/Search';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdOutlineChatBubbleOutline } from 'react-icons/md';
import moment from 'moment';

const Files = () => {
  const navigate = useNavigate();
  const [allFiles, setAllFiles] = useState();
  const [tableLoding, setTableloading] = useState(true);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [multipleDeleteModalVisible, setMultipleDeleteModalVisible] = useState(false);
  const [deleteRecord, setDeleteRecorde] = useState('');
  const [deleteMultipleRecord, setDeleteMultipleRecord] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  //search state
  const [searchInputValue, setSearchInputValue] = useState('');

  const openDeleteFileModal = (record) => {
    setDeleteModalVisible(true);
    setDeleteRecorde(record);
  };

  const openMultipleDeleteFileModal = () => {
    setMultipleDeleteModalVisible(true);
    setDeleteMultipleRecord(selectedRowKeys);
  };

  const handleInputChange = (e) => {
    setSearchInputValue(e.target.value);
  };

  const handleSearch = async () => {
    console.log('searchInputValue', searchInputValue);
  };

  const columns = [
    {
      title: 'Sr.No',
      dataIndex: 'srno',
      key: 'srno',
      align: 'center',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'User Name',
      dataIndex: 'user_name',
      key: 'user_name',
      align: 'center',
      render: (text) => <div>{text}</div>,
    },
    {
      // title: 'File Name',
      title: 'File / Web Url',
      dataIndex: 'uploaded_file',
      key: 'uploadedfile',
      align: 'center',
      render: (text, record) => (
        <a href={record.fileUrl} target='_blank' className='text-blue-500'>
          {text}
        </a>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      align: 'center',
      render: (text) => `${moment(text).format('DD-MM-YYYY')}`,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <a
            className='text-blue-500'
            onClick={() => navigate(`/file-chat/${record.docId}`, { state: { fileName: record } })}
          >
            <MdOutlineChatBubbleOutline color='#1677ff' size={18} />
          </a>
          {/* <a className='text-blue-500'>Edit {record.name}</a> */}
          {/* <a
            className='text-blue-500'
            onClick={() => {
              openDeleteFileModal(record);
            }}
          >
            Delete
          </a> */}
          <span
            style={{
              cursor: 'pointer',
            }}
          >
            <RiDeleteBin5Line
              color='red'
              size={18}
              onClick={() => {
                openDeleteFileModal(record);
              }}
            />
          </span>
        </Space>
      ),
    },
  ];

  //actual data show
  const transformedData =
    allFiles?.length &&
    allFiles?.map((item, index) => ({
      key: item?._id,
      id: (index + 1).toString(),
      srno: (index + 1).toString(),
      user_name: `${item?.user[0]?.firstName} ${item?.user[0]?.lastName}`,
      uploaded_file: item.filename,
      fileUrl: item?.url,
      docId: item?._id,
      date: item.timestamp,
    }));

  const getAllFiles = async () => {
    try {
      const response = await apiPOST(`/api/files`);
      // const response = await apiPOST(`/api/allFiles`)
      if (response?.status === 200 && response.data.isSuccess) {
        setAllFiles(response?.data?.files);
        setTableloading(false);
      } else {
        setTableloading(false);
      }
    } catch (error) {
      setTableloading(false);
      message.error('Something went wrong');
    }
  };

  const start = () => {
    setLoading(true);
    setModalVisible(true);
  };

  const handleOk = () => {
    const selectedFiles = selectedRowKeys;
    const selectedFilesData = transformedData.filter((item) => selectedRowKeys.includes(item.key));
    const selectedFileNames = selectedFilesData.map((item) => item.uploaded_file);
    setSelectedRowKeys([]);
    setLoading(false);
    navigate('/selected-files/chat', {
      state: {
        data: selectedFiles,
        fileName: selectedFileNames,
      },
    });
    setModalVisible(false);
  };

  const handleFileDelete = async () => {
    try {
      if (deleteRecord) {
        setDeleteLoading(true);
        const deleteResponse = await apiPUT(`/api/delete-single-file/${deleteRecord?.docId}`);
        console.log('deleteResponse === ', deleteResponse);
        if (deleteResponse.status === 200 && deleteResponse?.data?.status) {
          message.success(deleteResponse?.message || 'Delete file successfully');
          setDeleteLoading(false);
          setDeleteModalVisible(false);
          getAllFiles();
        } else if (deleteResponse.status === 404 && deleteResponse?.data?.status === false) {
          message.error('Something went wrong');
          setDeleteLoading(false);
          setDeleteModalVisible(false);
          return;
        } else {
          message.error('Something went wrong');
          setDeleteLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const handleMultipleFileDelete = async () => {
    try {
      if (deleteMultipleRecord) {
        setDeleteLoading(true);
        const payload = {
          uploadedFileIds: deleteMultipleRecord,
        };
        const deleteMultipleFileResponse = await apiPUT(`/api/delete-multiple-file/`, payload);
        if (deleteMultipleFileResponse?.data?.status) {
          message.success(deleteMultipleFileResponse?.message || 'Delete file successfully');
          setDeleteLoading(false);
          setMultipleDeleteModalVisible(false);
          setDeleteMultipleRecord('');
          setSelectedRowKeys([]);
          getAllFiles();
        } else {
          message.error('Something went wrong');
          setDeleteLoading(false);
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const onSelectChange = (newSelectedRowKeys) => {
    console.log('selectedRowKeys changed: ', newSelectedRowKeys);
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;

  useEffect(() => {
    getAllFiles();
  }, []);

  return (
    <>
      <div className='mb-2 flex justify-between'>
        <div>
          <div className='flex gap-2'>
            <Button className='bg-blue-100' onClick={start} disabled={!hasSelected} loading={loading}>
              Chat
            </Button>
            <Button
              className='bg-blue-100'
              onClick={() => {
                openMultipleDeleteFileModal();
              }}
              disabled={!hasSelected}
              loading={loading}
            >
              Multiple delete
            </Button>
          </div>
          <span className='mt-2'>{hasSelected ? `Selected ${selectedRowKeys.length} items` : ''}</span>
        </div>
        <div>
          <Search
            placeholder='Search file by file name or user name'
            enterButton={'Search'}
            size='middle'
            value={searchInputValue}
            onChange={handleInputChange}
            onSearch={handleSearch}
            // loading={isLoading}
            style={{
              color: '#ffffff',
            }}
            className='custom-search-input bg-blue-500 rounded-lg'
          />
        </div>
      </div>

      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={transformedData}
        bordered
        // rowKey={(record) => record._id}
        loading={tableLoding}
      />

      <Modal
        title='Files Selected'
        visible={modalVisible} // Set the visibility based on your logic
        onOk={handleOk}
        onCancel={() => {
          setLoading(false);
          setModalVisible(false);
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
      >
        {/* Add content for the modal, e.g., a message or additional options */}
        <p>
          <span className='text-yellow-700 text-base font-bold'>Warning:</span> Selecting too many pdf's may decrease
          the quality of the results.
        </p>
      </Modal>

      <Modal
        title='File Deleted'
        visible={deleteModalVisible} // Set the visibility based on your logic
        onOk={handleFileDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setDeleteRecorde('');
          setDeleteLoading(false);
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={'Delete'}
        confirmLoading={deleteLoading}
      >
        {/* Add content for the modal, e.g., a message or additional options */}
        <p className='font-bold text-base'>
          <span className='text-yellow-700 text-base font-bold'>Warning:</span> Are you sure you want to delete this
          file?
        </p>
        <p className='warning'> Deleting all related data for this file will result in permanent data loss.</p>
      </Modal>

      <Modal
        title='Multiple File Deleted'
        visible={multipleDeleteModalVisible} // Set the visibility based on your logic
        onOk={handleMultipleFileDelete}
        onCancel={() => {
          setMultipleDeleteModalVisible(false);
          setDeleteMultipleRecord('');
          setDeleteLoading(false);
        }}
        okButtonProps={{ style: { backgroundColor: 'blue' } }}
        okText={'Delete'}
        confirmLoading={deleteLoading}
      >
        {/* Add content for the modal, e.g., a message or additional options */}
        <p className='font-bold text-base'>
          <span className='text-yellow-700 text-base font-bold'>Warning:</span> Are you sure you want to delete multiple
          file?
        </p>
        <p className='warning'> Deleting all related data for this files will result in permanent data loss.</p>
      </Modal>
    </>
  );
};
export default Files;
