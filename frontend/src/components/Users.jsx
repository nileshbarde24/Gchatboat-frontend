import { Button, Space, Table, Modal, Form, Input, message, Spin, Select, Switch } from 'antd';
import { useEffect, useState } from 'react';
import { apiGET, apiPOST, apiPUT } from '../utils/apiHelper';
import Search from 'antd/es/input/Search';
import DeleteSingleUserModal from '../modals/DeleteSingleUserModal';
import DeleteMultipleUserModal from '../modals/DeleteMultipleUserModal';


// const data = [
//     {
//         key: '1',
//         name: 'John Brown',
//         email: 'mkidner0@netlog.com',
//         role: "Individual",
//         company: "New York No. 1 Lake Park",
//     }
// ];
const Users = () => {
  const [form] = Form.useForm();
  const formRef = form;
  //add multiple role as you wish
  const customOptions = ['End-User'];

  const [addUserButton, setAddUserButton] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState(customOptions);
  const [companyData, setCompanyData] = useState();
  const [allUsers, setAllUsers] = useState();
  const [tableLoding, setTableLoding] = useState(true);
  const [searchLoding, setSearchLoding] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [searchTableData, setSearchTableData] = useState();
  const [loading, setLoading] = useState(false);
  const [statusDisabled, setStatusDisabled] = useState(false);

  //delete user modal related 
  const [deleteUserModalVisible, setDeleteUserModalVisible] = useState(false)
  const [singleUserRecord, setSingleUserRecord] = useState('')
  const [deleteMultipleUserModalVisible, setDeleteMultipleUserModalVisible] = useState(false)

  //select user
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  const openDeleteUserModal = (record) => {
    setDeleteUserModalVisible(true)
    setSingleUserRecord(record)
  }

  const closeDeleteUserModal = (record) => {
    setDeleteUserModalVisible(false)
    setSingleUserRecord('')
    getAllUsers()
  }

  const closeDeleteMulipleUserModal = () => {
    setDeleteMultipleUserModalVisible(false)
    getAllUsers()
  }

  const handleStatusToggle = async (checked, record) => {
    console.log(`User ${record.key} is ${checked ? 'enabled' : 'disabled'}`);
    try {
      const payload = {
        "userStatus": `${checked ? 'enabled' : 'disabled'}`
      }
      setStatusDisabled(true)
      const response = await apiPUT(`/api/update-user-status/${record.key}`, payload)
      if (response?.status === 200) {
        setStatusDisabled(false)
        message.success(`User status ${checked ? 'enabled' : 'disabled'} successfully`)
        getAllUsers()
      } else {
        setStatusDisabled(false)
        message.error(response?.data?.message)
        getAllUsers()
      }
    } catch (error) {
      setStatusDisabled(false)
      console.log(error)
    }
  };

  const columns = [
    {
      title: 'Sr.No',
      dataIndex: 'srno',
      key: 'srno',
      render: (text) => <div>{text}</div>,
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <div className='capitalize'>{text}</div>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (text) => (
        <span
          className={`role-cell uppercase ${text === 'Individual'
            ? 'bg-[#f6ffed] text-[#389e0d] border border-[#b7eb8f] rounded-md p-1'
            : 'bg-[#f0f5ff] text-[#1d39c4] border border-[#adc6ff] rounded-md p-1'
            }`}
        >
          {text}
        </span>
      ),
    },
    {
      title: 'Company',
      dataIndex: 'company',
      key: 'company',
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size='middle'>{console.log("xxxxxxxxxx", record.userStatus)}
          <Switch
            checked={record.userStatus === "enabled" ? true : false}  // Assuming 'enabled' is a property in your record
            onChange={(checked) => handleStatusToggle(checked, record)}
            checkedChildren="enabled" unCheckedChildren="disabled"
            className='bg-gray-500'
            disabled={statusDisabled}
          />
          <a className='text-blue-500' onClick={() => { openDeleteUserModal(record) }}>Delete</a>
        </Space>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const hasSelected = selectedRowKeys.length > 0;


  const handleRoleChange = (value) => {
    console.log(`Selected: ${value}`);
    setRole(value);
  };

  const userDataString = localStorage.getItem('user'); //get user from local storage
  //actual data show
  const transformedData =
    allUsers?.length &&
    allUsers?.map((item, index) => ({
      key: item?._id,
      srno: (index + 1).toString(),
      name: `${item.firstName} ${item.lastName}`,
      email: item.email,
      role: item.role,
      company: item.companyName || 'N/A',
      userId: item?._id,
      userStatus: item?.userStatus
    }));

  //search data show
  const transformedSearchData =
    searchTableData?.length &&
    searchTableData?.map((item, index) => ({
      key: (index + 1).toString(),
      srno: (index + 1).toString(),
      name: `${item.firstName} ${item.lastName}`,
      email: item.email,
      role: item.role,
      company: item.companyName || 'N/A',
      userId: item?._id,
      userStatus: item?.userStatus
    }));

  //handle for searh user
  const handleSearch = async () => {
    if (searchText) {
      setSearchLoding(true);
      const payload = {
        searchText: searchText,
      };
      const response = await apiPOST(`api/users`, payload);
      console.log('respo', response);
      if (response?.status === 200) {
        message.success('User found successfully');
        setSearchTableData(response?.data?.users);
        setSearchLoding(false);
      } else {
        message.error('User not found');
        setSearchLoding(false);
      }
    } else {
      message.info("Please enter search text")
    }
  };

  let loginUserData;
  if (userDataString) {
    loginUserData = JSON.parse(userDataString);
  }
  //get login user
  const getLoginUser = async () => {
    const userDataString = localStorage.getItem('user');
    if (userDataString) {
      const userData = JSON.parse(userDataString);
      if (userData.role === 'Administrator') {
        if (userData.companyId) {
          let response = await apiGET('api/getCompany');
          const insertedId = userData?.companyId;
          const matchingCompany = response?.data?.company.find((company) => company._id === insertedId);
          if (matchingCompany) {
            setCompanyData(matchingCompany);
          }
        }
        setAddUserButton(true);
      } else {
        setAddUserButton(false);
      }
    } else {
      console.log('User data not found in localStorage');
    }
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  //get all users
  const getAllUsers = async () => {
    try {
      const payload = {
        firstName: '',
      };
      const response = await apiPOST(`/api/users`, payload);

      if (response?.status !== 200) {
        return message.error('Something went wrong!');
      }

      if (response?.status === 200) {
        setAllUsers(response?.data?.users);
      }

    } catch (error) {
      console.log(error);
      message.error('Something went wrong!');
    } finally {
      setTableLoding(false);
    }
  };

  //model detail handel
  const onFinish = async () => {

    if (!firstName || !lastName || !email || !role) {
      message.error('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const getCopanyResponse = await apiGET(`/api/getCompanyByUser/${loginUserData?._id}`);
    if (getCopanyResponse?.data?.data?._id) {
      const payload = {
        firstName,
        lastName,
        email,
        password: 'Sample@123',
        accountType: 'Individual',
        role: role,
        companyName: companyData?.name,
        companyIdUserAddFromAdmin: getCopanyResponse?.data?.data?._id,
      };
      try {
        let response = await apiPOST('api/register', payload);
        if (response.data.status) {
          const addUserPayload = {
            userId: response?.data?.data?._id,
            role: role,
          };
          const responseAddUser = await apiPUT(`/api/updateCompanyByUser/${loginUserData?._id}`, addUserPayload);
          if (responseAddUser) {
            message.success('User add successful!');
            formRef.resetFields();
            getAllUsers();
            setIsModalVisible(false);
          }
        } else {
          message.error(response?.data?.message);
        }
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
        setIsModalVisible(false); // Close the modal after submission
      }

    } else {
      message.error('Something went wrong');
    }
  };

  const handleCancel = () => {
    // Clear form fields and close the modal
    setFirstName('');
    setLastName('');
    setEmail('');
    setIsModalVisible(false);
  };

  useEffect(() => {
    getLoginUser();
    getAllUsers();
  }, []);
  return (
    <>
      {addUserButton ? (
        <div className='flex justify-between items-center mb-4'>
          <div className='flex w-[400px]'>
            <Search
              placeholder="Search file"
              enterButton={'Search'}
              size="middle"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onSearch={handleSearch}
              loading={searchLoding}
              style={{ color: '#ffffff', }}
              className='custom-search-input bg-blue-500 rounded-lg'

            />
          </div>
          <div className='flex gap-2'>
            <Button onClick={showModal} className='bg-blue-100'>
              Add User
            </Button>
            <Button disabled={!hasSelected} onClick={() => { setDeleteMultipleUserModalVisible(true) }} className='bg-blue-100'>
              Delete multiple user
            </Button>
          </div>
        </div>
      ) : null}
      <Modal
        title={`Add User For ${companyData?.name ? companyData?.name : null}`}
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
      >
        <Form form={form} labelCol={{ span: 6 }} wrapperCol={{ span: 16 }} name='userForm' onFinish={onFinish}>
          <Form.Item
            name='firstName'
            label='First Name'
            rules={[{ required: true, message: 'Please enter your first name' }]}
          >
            <Input
              onChange={(e) => setFirstName(e.target.value)}
              value={firstName}
              onKeyPress={(e) => {
                // Check if the character is not a letter (a-z or A-Z)
                if (!/^[a-zA-Z]+$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item
            name='lastName'
            label='Last Name'
            rules={[{ required: true, message: 'Please enter your last name' }]}
          >
            <Input
              onChange={(e) => setLastName(e.target.value)}
              value={lastName}
              onKeyPress={(e) => {
                // Check if the character is not a letter (a-z or A-Z)
                if (!/^[a-zA-Z]+$/.test(e.key)) {
                  e.preventDefault();
                }
              }}
            />
          </Form.Item>
          <Form.Item name='email' label='email' rules={[{ required: true, message: 'Please enter your last name' }]}>
            <Input
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              onKeyPress={(e) => {
                // Check if the character is not a letter (a-z or A-Z)
                if (!/^[a-zA-Z@.0-9]+$/.test(e.key)) {
                  e.preventDefault();
                }
              }}

            />
          </Form.Item>
          <Form.Item name='role' label='Role' rules={[{ required: true, message: 'Please select role' }]}>
            <Select
              mode='tags'
              placeholder='ex: End-User'
              // defaultValue={['End-User']}
              onChange={handleRoleChange}
              style={{ width: '100%' }}
            >
              {customOptions.map((option) => (
                <Option key={option} value={option}>
                  {option}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item className='flex justify-end'>
            <Button className='bg-blue-100' htmlType='submit' loading={loading} >
              Create
            </Button>
          </Form.Item>
        </Form>
      </Modal>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={transformedSearchData?.length && searchText?.length ? transformedSearchData : transformedData}
        loading={tableLoding}
      />

      {/* Single user delete modal */}
      {
        deleteUserModalVisible ?
          <DeleteSingleUserModal
            deleteUserModalVisible={deleteUserModalVisible}
            closeDeleteUserModal={closeDeleteUserModal}
            singleUserRecord={singleUserRecord}
          />
          : null
      }
      {/* Multiple user delete modal */}
      {
        deleteMultipleUserModalVisible ?
          <DeleteMultipleUserModal
            deleteMultipleUserModalVisible={deleteMultipleUserModalVisible}
            closeDeleteMulipleUserModal={closeDeleteMulipleUserModal}
            selectedRowKeys={selectedRowKeys}
          />
          : null
      }
    </>
  );
};
export default Users;
