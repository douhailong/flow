import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';
import type { SiderBarProps } from './index';

const levelOptons = [
  { value: 1, label: '1级' },
  { value: 2, label: '2级' },
  { value: 3, label: '3级' }
];

const Step3: React.FC<SiderBarProps> = ({
  selectedNode,
  parentNode,
  onFinish
}) => {
  const [form] = Form.useForm();

  return (
    <div>
      <div className='pb-2'>判断详情</div>
      <div className='text-sm mb-2'>判断符</div>
      <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>
        {parentNode?.data.title}
      </div>
      <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
      <Form.Item name='belong' noStyle initialValue={1}>
        <Radio.Group>
          <Radio className='w-full mb-2' value={1}>
            是（即条件成立）
          </Radio>
          <Radio className='w-full mb-2' value={0}>
            否（即条件不成立）
          </Radio>
        </Radio.Group>
      </Form.Item>
      <div className='text-sm text-gray-600 mb-2'>则进入下一步</div>
      <Form
        clearOnDestroy
        form={form}
        onFinish={(values) => {
          onFinish({ step: 3, values });
        }}
      >
        <div className='mb-2'>警示设置：</div>
        <div className='text-xs mb-2'>警示等级</div>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name='relation' initialValue={1}>
              <Select placeholder='请选择' options={levelOptons} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name='key' initialValue={1}>
              <Select
                placeholder='请选择'
                options={[
                  { value: 1, label: '字典' },
                  { value: 2, label: '关键字' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='key' initialValue={1}>
          <Input.TextArea autoSize={{ maxRows: 3, minRows: 3 }} />
        </Form.Item>

        <div className='text-xs mb-2'>处理建议</div>
        <Form.Item name='relation' initialValue={1}>
          <Select placeholder='请选择' options={levelOptons} />
        </Form.Item>
        <Form.Item name='key' initialValue={1}>
          <Input.TextArea autoSize={{ maxRows: 3, minRows: 3 }} />
        </Form.Item>

        <Form.Item name='key' initialValue={1} className='w-1/3'>
          <Select
            placeholder='请选择'
            options={[
              { value: 1, label: '字典' },
              { value: 2, label: '关键字' }
            ]}
          />
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

export default Step3;
