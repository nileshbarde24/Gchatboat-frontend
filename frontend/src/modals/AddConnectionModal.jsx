import React, { useEffect, useState } from 'react';
import { Button, Form, Input, Modal, Radio, message } from 'antd';

const AddConnectionModal = ({ open, onCreate, onCancel, isConnLoading, isUpdateConnection, dbConnection }) => {
  const [form] = Form.useForm();
  const [isTestConnClicked, setIsTestConnClicked] = useState(false);

  const handleTestConnection = () => {
    form
      .validateFields()
      .then((values) => {
        // form.resetFields();
        const { database, host, name, password, port, type, username } = values;

        if (!database || !host || !name || !password || !port || !type || !username) {
          return message.error('Invalid Connection Parameters!');
        }

        const data = { ...values, isTestConnection: true };

        onCreate(data, form);
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });

    setIsTestConnClicked(false);
  };

  useEffect(() => {
    if (isUpdateConnection && dbConnection) {
      console.log('Add Connection Modal -  Update Data::: ', dbConnection);
      form.setFieldsValue(dbConnection);
    }

    // console.log({
    //   isUpdateConnection,
    //   dbConnection,
    // });
  }, [isUpdateConnection, dbConnection]);

  return (
    <>
      <Modal
        open={open}
        title={`${isUpdateConnection && dbConnection ? 'Update' : 'Setup New '} Connection`}
        // okText='Create'
        okText={isUpdateConnection && dbConnection ? 'Update' : 'Create'}
        cancelText='Cancel'
        onCancel={() => onCancel(form)}
        onOk={() => {
          form
            .validateFields()
            .then((values) => {
              // form.resetFields();

              const { database, host, name, password, port, type, username } = values;

              if (!database || !host || !name || !password || !port || !type || !username) {
                return message.error('Invalid Connection Parameters!');
              }

              const data = { ...values, isTestConnection: false };

              onCreate(data, form);
            })
            .catch((info) => {
              console.log('Validate Failed:', info);
            });
        }}
        okButtonProps={{
          className: 'bg-blue-500',
          loading: isConnLoading,
        }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <Button
              onClick={() => {
                setIsTestConnClicked(true);
                handleTestConnection();
              }}
              loading={isTestConnClicked}
            >
              Test Connection
            </Button>
            <CancelBtn />
            <OkBtn />
          </>
        )}
      >
        <Form
          form={form}
          // layout='vertical'
          layout='horizontal'
          name='form_in_modal'
          className='mt-4'
          initialValues={{
            type: 'mysql',
          }}
          // if layout = vertical comment out labelCol, wrapperCol and labelAlign
          labelCol={{
            span: 6,
          }}
          wrapperCol={{
            span: 18,
          }}
          labelAlign='left'
        >
          <Form.Item
            name='name'
            label='Conn. Name'
            rules={[
              {
                required: true,
                message: 'Please enter connection name',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='host'
            label='Host'
            rules={[
              {
                required: true,
                message: 'Please enter host!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='port'
            label='Port'
            rules={[
              {
                required: true,
                message: 'Please enter port!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name='username'
            label='Username'
            rules={[
              {
                required: true,
                message: 'Please enter username!',
              },
            ]}
          >
            <Input disabled={isUpdateConnection && dbConnection ? true : false} />
          </Form.Item>

          <Form.Item
            name='password'
            label='Password'
            rules={[
              {
                required: true,
                message: 'Please enter password!',
              },
            ]}
          >
            <Input.Password disabled={isUpdateConnection && dbConnection ? true : false} />
          </Form.Item>

          <Form.Item
            name='database'
            label='Database'
            rules={[
              {
                required: true,
                message: 'Please enter database!',
              },
            ]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            label='Databse Type '
            name='type'
            // className='collection-create-form_last-form-item'
            rules={[
              {
                required: true,
                message: 'Please select database type!',
              },
            ]}
          >
            <Radio.Group>
              <Radio value='mysql'>MySQL</Radio>
              <Radio value='postgres'>PostgreSQL</Radio>
            </Radio.Group>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};
export default AddConnectionModal;
