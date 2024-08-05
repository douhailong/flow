import React, { useEffect } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';

type Setup2Props = { selectedNode?: FlowViewNode; onFinish: (title: string) => void };

const Setup2: React.FC<Setup2Props> = ({ selectedNode, onFinish }) => {
  const [form] = Form.useForm<{ title: string }>();

  return (
    <div>
      <div className='text-xl pb-3'>节点详情</div>
      <Form form={form} onFinish={(values) => {}}>
        {selectedNode?.data.metadata.type === 'node' && (
          <>
            <div className='text-lg mb-2'>节点判断</div>
            <div className='p-3 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>
              用药途径 属于 外用
            </div>
            <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
            <Form.Item name='belong' noStyle>
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
          </>
        )}
        <div className='text-lg mb-2'>节点设置</div>
        <Form.Item name='title'>
          <Select size='large' placeholder='请选择' />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name='title'>
              <Select
                size='large'
                placeholder='请选择'
                options={[
                  { value: 1, label: '属于' },
                  { value: 2, label: '不属于' },
                  { value: 1, label: '匹配' },
                  { value: 2, label: '为空' }
                ]}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item name='title'>
              <Select
                size='large'
                placeholder='请选择'
                options={[
                  { value: 1, label: '字典' },
                  { value: 2, label: '关键字' }
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item>
          <Button type='primary' size='large' block htmlType='submit'>
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Setup2;
