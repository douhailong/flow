import React, { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';
import type { SiderBarProps } from './index';

const Step1: React.FC<SiderBarProps> = ({ selectedNode, onFinish }) => {
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
          trimTitle === ''
            ? message.error('请输入分支名称')
            : onFinish({ step: 1, values: { title: trimTitle } });
        }}
      >
        <Form.Item name='title'>
          <Input placeholder='请输入分支名称' />
        </Form.Item>
        <Form.Item>
          <Button type='primary' block htmlType='submit'>
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Step1;
