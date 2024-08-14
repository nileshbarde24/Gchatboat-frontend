import React, { useEffect, useState } from 'react';
import { Space, Table, Button, message, Tooltip, Modal } from 'antd';
import { FiEdit3 } from 'react-icons/fi';
import { RiDeleteBin5Line } from 'react-icons/ri';
import { MdOutlineChatBubbleOutline } from 'react-icons/md';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { apiPOST } from '../utils/apiHelper';
import AddConnectionModal from '../modals/AddConnectionModal';
import { ExclamationCircleFilled, PlayCircleOutlined, LoadingOutlined } from '@ant-design/icons';
import { GoCheckCircle } from 'react-icons/go';

const { confirm } = Modal;

const ConnectionSuccessModal = ({ handleCancel, handleOk, isModalOpen, connection }) => {
  return (
    <Modal
      title='Connection Made Successfully'
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      okButtonProps={{ className: 'bg-blue-500' }}
    >
      <p>Information related to this connection:</p>
      <br />
      <p>
        <b>Host:</b> {connection?.host || ''}
      </p>
      <p>
        <b>Port:</b> {connection?.port || ''}
      </p>
      <p>
        <b>User:</b> {connection?.username || ''}
      </p>
      <p>
        <b>Datbase:</b> {connection?.database || ''}
      </p>
      <br />
      <p>A successful database connection was made with the parameters defined for this connection.</p>
    </Modal>
  );
};

const ConnectionList = () => {
  // Update:
  const [isUpdateConnection, setIsUpdateConnection] = useState(false);
  const [dbConnection, setDbConnection] = useState(null);

  const [isTestConnectionClicked, setIsTestConnectionClicked] = useState(false);
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [selectedConnection, setSelectedConnection] = useState('');

  const [isConnLoading, setIsConnLoading] = useState(false);
  const [deleteConnLoading, setDeleteConnLoading] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [dbConnections, setDbConnections] = useState([]);
  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
    },
  });

  const navigate = useNavigate();

  // modal:
  const [open, setOpen] = useState(false);

  // connection success modal:
  const [isModalOpen, setIsModalOpen] = useState(false);

  const showModal = () => {
    setIsModalOpen(true);
  };
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };

  const onUpdate = async (values, form) => {
    if (!dbConnection || !dbConnection?._id) {
      return message.error('Invalid Parameters');
    }
    const updateBody = {
      ...values,
      _id: dbConnection?._id,
    };

    const { isTestConnection } = values;
    console.log('updateBody :: ', updateBody);

    try {
      const response = await apiPOST('/api/update-connection', updateBody);
      console.log('onUpdate Response : ', response);

      if (response.status === 200 && response?.data?.isSuccess) {
        if (!isTestConnection) {
          message.success(response?.data?.message || 'Connection Updated Successfully');
          form?.resetFields();
          getAllConnections();
          return;
        }

        // show test connection success modal:

        setSelectedConnection({
          host: values?.host,
          port: values?.port,
          username: values?.username,
          database: values?.database,
        });

        return showModal();
      }

      if (!response.data.isSuccess && response?.data?.error?.code === 'ER_ACCESS_DENIED_ERROR') {
        return message.error(response?.data?.error?.sqlMessage || 'Error!');
      }

      message.error('Something went wrong!');
    } catch (error) {
      console.log('onUpdate error: ', error);
      message.error('Something went wrong!');
    } finally {
      setIsConnLoading(false);
      setIsUpdateConnection(false);
      setDbConnection(null);
      setOpen(false);
    }
  };

  const onCreate = async (values, form) => {
    // console.log('Received values of form: ', values);
    const { isTestConnection } = values;

    console.log({
      isTestConnection,
      values,
    });

    setIsConnLoading(true);

    if (isUpdateConnection && dbConnection) {
      onUpdate(values, form);
      return;
    }

    try {
      const response = await apiPOST('/api/initiate-db-connection', values);
      console.log('Response : ', response.data);

      if (response.data.isSuccess && response?.data?.data?.isInitialized) {
        if (response?.data?.message === 'Connection already exists!') {
          form?.resetFields();
          return message.info(response?.data?.message);
        }

        if (!isTestConnection) {
          message.success('Connection added successfully!');
          form?.resetFields();
          setOpen(false);
          getAllConnections();
          return;
        }

        // passing db params to db connection success modal
        setSelectedConnection({
          host: values?.host,
          port: values?.port,
          username: values?.username,
          database: values?.database,
        });

        return showModal();
        // return message.success('Connection established!');
      }

      if (!response.data.isSuccess && response?.data?.error?.code === 'ER_ACCESS_DENIED_ERROR') {
        return message.error(response?.data?.error?.sqlMessage || 'Error!');
      }

      message.error('Something went wrong!');

      // TODO call GetALlConnection
    } catch (error) {
      console.log('Error : ', error);
      message.error('Something went wrong!');
      setOpen(false);
    } finally {
      setIsConnLoading(false);
    }
  };

  // Delete Connection:
  const hanldeDelete = async (connectionId) => {
    console.log('handleDelete connectionId: ', connectionId);
    setDeleteConnLoading(true);
    try {
      const response = await apiPOST('/api/delete-connection', {
        connectionId,
      });

      console.log('response::: ', response);

      if (!response.data.isSuccess) {
        return message.error(response?.data?.error || 'Something went wrong');
      }

      if (response.data.isSuccess && response?.data?.data?.deletedCount > 0) {
        getAllConnections();
        return message.success('Connection deleted successfully');
      }
    } catch (error) {
      console.log(error);
      message.error(error);
    } finally {
      setDeleteConnLoading(false);
    }
  };

  const showDeleteConfirm = (connectionId) => {
    confirm({
      title: 'Delete the connection?',
      icon: <ExclamationCircleFilled />,
      content: 'Do you want to delete this connection?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      centered: true,
      onOk() {
        console.log('OK');
        hanldeDelete(connectionId);
      },
      onCancel() {
        console.log('Cancel');
      },
      okButtonProps: {
        loading: deleteConnLoading,
      },
    });
  };

  const hanldeTestConnection = async (connection) => {
    const data = { ...connection, isTestConnection: true };
    await onCreate(data);
    setIsTestConnectionClicked(false);
    setSelectedConnId(null);
  };

  const columns = [
    {
      title: 'Sr No',
      dataIndex: 'index',
      key: 'index',
      render: (text, record, index) =>
        (tableParams.pagination.current - 1) * tableParams.pagination.pageSize + index + 1,
      align: 'center',
    },
    {
      title: 'Connection Name',
      dataIndex: 'name',
      key: 'name',
      align: 'center',
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      align: 'center',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host',
      align: 'center',
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port',
      align: 'center',
    },
    {
      title: 'Database',
      dataIndex: 'database',
      key: 'database',
      align: 'center',
      // render: (text) => <RandomColorTag text={text} />,
    },
    {
      title: 'Created Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      align: 'center',
      render: (text) => `${moment(text).format('DD-MM-YYYY')}`,
      // render: (text, record, index) => `${moment(text).format('DD-MM-YYYY')} ${moment(text).format('LTS')}`,
    },
    {
      title: 'Action',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Space size='middle'>
          <span
            style={{
              cursor: 'pointer',
            }}
            onClick={() =>
              navigate(`/sql-chat/${record._id}`, {
                state: record,
              })
            }
          >
            <Tooltip title='Chat'>
              <MdOutlineChatBubbleOutline color='#1677ff' size={18} />
            </Tooltip>
          </span>
          <span
            onClick={() => {
              setDbConnection(record);
              setIsUpdateConnection(true);
              setOpen(true);
            }}
            style={{
              cursor: 'pointer',
            }}
          >
            <Tooltip title='Edit Connection'>
              <FiEdit3 size={18} />
            </Tooltip>
          </span>
          <span
            style={{
              cursor: 'pointer',
            }}
          >
            {isTestConnectionClicked && record?._id === selectedConnId ? (
              <LoadingOutlined size={18} />
            ) : (
              <GoCheckCircle
                size={18}
                onClick={() => {
                  setSelectedConnId(record._id);
                  setIsTestConnectionClicked(true);
                  hanldeTestConnection(record);
                }}
              />
            )}
          </span>
          <span
            style={{
              cursor: 'pointer',
            }}
          >
            <RiDeleteBin5Line color='red' size={18} onClick={() => showDeleteConfirm(record?._id)} />
          </span>
        </Space>
      ),
    },
  ];

  const handleTableChange = (pagination, filters, sorter) => {
    console.log({
      pagination,
      filters,
      sorter,
    });

    // setTableParams({
    //   pagination,
    //   filters,
    //   ...sorter,
    // });

    // // `dataSource` is useless since `pageSize` changed
    // if (pagination.pageSize !== tableParams.pagination?.pageSize) {
    //   setProducts([]);
    // }
  };

  const getAllConnections = async () => {
    setIsLoading(true);
    try {
      const res = await apiPOST(`/api/connections`);

      if (res.status === 200 && res?.data?.isSuccess) {
        setDbConnections(res?.data?.data);
      } else {
        console.error('getAllConnections error:', res.data.error || 'Unknown error');
        message.error('Something went wrong!');
      }
    } catch (error) {
      console.log('getAllConnections error: ' + error);
      message.error('Something went wrong!');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAllConnections();
  }, []);

  return (
    <>
      <Button
        type='primary'
        className='custom-search-input bg-blue-500 rounded-lg mb-4'
        onClick={() => {
          setOpen(true);
        }}
      >
        Add Connection
      </Button>

      <Table
        dataSource={dbConnections}
        columns={columns}
        bordered
        rowKey={(record) => record._id}
        loading={isLoading}
        pagination={tableParams.pagination}
        onChange={handleTableChange}
      />

      <AddConnectionModal
        open={open}
        onCreate={onCreate}
        onCancel={(form) => {
          form.resetFields();
          setIsUpdateConnection(false);
          setDbConnection(null);
          setOpen(false);
        }}
        isConnLoading={isConnLoading}
        isUpdateConnection={isUpdateConnection}
        dbConnection={dbConnection}
      />

      <ConnectionSuccessModal
        handleCancel={handleCancel}
        handleOk={handleOk}
        isModalOpen={isModalOpen}
        connection={selectedConnection}
      />
    </>
  );
};

export default ConnectionList;
