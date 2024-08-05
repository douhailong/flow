import React, { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';

type Setup1Props = { selectedNode?: FlowViewNode; onFinish: (title: string) => void };

const Setup1: React.FC<Setup1Props> = ({ selectedNode, onFinish }) => {
  const [form] = Form.useForm<{ title: string }>();

  useEffect(() => {
    form.setFieldsValue({ title: selectedNode?.data.title });
  }, [selectedNode?.id]);

  return (
    <div>
      <div className='text-xl pb-3'>分支详情</div>
      <div className='text-lg mb-2'>分支名称</div>
      <Form
        form={form}
        onFinish={(values) => {
          const trimTitle = values.title.trim();
          trimTitle === '' ? message.error('请输入分支名称') : onFinish(trimTitle);
        }}
      >
        <Form.Item name='title'>
          <Input size='large' placeholder='请输入分支名称' />
        </Form.Item>
        <Form.Item>
          <Button type='primary' size='large' block htmlType='submit'>
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Setup1;
