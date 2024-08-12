import React, { useEffect } from 'react';
import { Button, Form, Input, message } from 'antd';
import type { SiderBarProps } from './';

const Step1: React.FC<SiderBarProps & { prefix: '规则' | '分支' }> = ({
  selectedNode,
  onFinish,
  prefix
}) => {
  const [form] = Form.useForm<{ title: string }>();

  useEffect(() => {
    form.setFieldsValue({ title: selectedNode?.data.title });
  }, [selectedNode.id]);

  return (
    <div>
      <div className='pb-2'>{prefix}详情</div>
      <div className='text-sm mb-2'>{prefix}名称</div>
      <Form
        form={form}
        onFinish={(values) => {
          const trimTitle = values.title.trim();
          trimTitle === ''
            ? message.error(`请输入${prefix}名称`)
            : onFinish({ step: 1, title: trimTitle });
        }}
      >
        <Form.Item name='title'>
          <Input placeholder={`请输入${prefix}名称`} />
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
