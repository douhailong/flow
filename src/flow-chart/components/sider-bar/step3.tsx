import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';
import type { SiderBarProps } from './index';

const levelOptons = [
  { value: 1, label: '1级' },
  { value: 2, label: '2级' },
  { value: 3, label: '3级' }
];

const arr = ['1级', '2级', '3级'];

const options = [
  { value: 'name', label: '药品·名称' },
  { value: 'minDose', label: '最小可分剂量' }
];

const Step3: React.FC<SiderBarProps> = ({ selectedNode, parentNode, onFinish }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    selectedNode?.data.warnContent
      ? form.setFieldsValue(selectedNode?.data.warnContent)
      : form.resetFields();
  }, [selectedNode?.id]);

  return (
    <div>
      <div className='pb-2'>判断详情</div>
      <div className='text-sm mb-2'>判断符</div>
      <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2 text-sm'>
        {parentNode?.data.title}
      </div>
      <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
      <Form
        clearOnDestroy
        form={form}
        onFinish={(values) => {
          const title = `${arr[form.getFieldValue('warnLevel') - 1]} ${form.getFieldValue('warnContent')}\n建议：${form.getFieldValue('suggestion')}`;
          onFinish({ step: 3, values, title });
        }}
      >
        <Form.Item name='sourceResult' noStyle initialValue='T'>
          <Radio.Group>
            <Radio className='w-full mb-2' value='T'>
              是（即条件成立）
            </Radio>
            <Radio className='w-full mb-2' value='F'>
              否（即条件不成立）
            </Radio>
          </Radio.Group>
        </Form.Item>
        <div className='text-sm text-gray-600 mb-2'>则进入下一步</div>

        <div className='mb-2'>警示设置：</div>
        <div className='text-xs mb-2'>警示等级</div>
        <Row gutter={12}>
          <Col span={8}>
            <Form.Item name='warnLevel' initialValue={1}>
              <Select placeholder='请选择' options={levelOptons} />
            </Form.Item>
          </Col>
          <Col span={16}>
            <Form.Item name='warnParam' initialValue='name'>
              <Select
                placeholder='请选择'
                options={options}
                onChange={(val) =>
                  form.setFieldValue(
                    'warnContent',
                    val === 'name' ? '[药品·名称] ' : '[最小可分剂量] '
                  )
                }
              />
            </Form.Item>
          </Col>
        </Row>
        <Form.Item name='warnContent' initialValue='[药品·名称] '>
          <Input.TextArea
            autoSize={{ maxRows: 3, minRows: 3 }}
            onChange={(e) => {
              const variable =
                form.getFieldValue('warnParam') === 'name' ? '[药品·名称] ' : '[最小可分剂量] ';
              !e.target.value.includes(variable) &&
                form.setFieldsValue({
                  warnContent: variable
                });
            }}
          />
        </Form.Item>

        <div className='text-xs mb-2'>处理建议</div>
        <Form.Item name='suggestParam' initialValue='name'>
          <Select
            placeholder='请选择'
            options={options}
            onChange={(val) =>
              form.setFieldValue('suggestion', val === 'name' ? '[药品·名称] ' : '[最小可分剂量] ')
            }
          />
        </Form.Item>
        <Form.Item name='suggestion' initialValue='[药品·名称] '>
          <Input.TextArea
            autoSize={{ maxRows: 3, minRows: 3 }}
            onChange={(e) => {
              const variable =
                form.getFieldValue('suggestParam') === 'name' ? '[药品·名称] ' : '[最小可分剂量] ';
              !e.target.value.includes(variable) &&
                form.setFieldsValue({
                  suggestion: variable
                });
            }}
          />
        </Form.Item>

        <Form.Item name='isWarnUse' initialValue='T' className='w-1/3'>
          <Select
            placeholder='请选择'
            options={[
              { value: 'T', label: '已启用' },
              { value: 'F', label: '未启用' }
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
