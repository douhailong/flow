import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';
import type { SiderBarProps } from './index';

const relationOptons1 = [
  { value: 1, label: '属于' },
  { value: 2, label: '不属于' },
  { value: 3, label: '匹配' },
  { value: 4, label: '为空' }
];

const relationOptons2 = [...relationOptons1, { value: 5, label: '等于' }];

const determineTargetOptions = [
  { value: 1, label: '特殊用法' },
  { value: 2, label: '用药途径' },
  { value: 3, label: '每次剂量' },
  { value: 4, label: '每天剂量' },
  { value: 5, label: '就诊来源' },
  { value: 7, label: '诊断名称' },
  { value: 6, label: '年龄' },
  { value: 8, label: '药品.剂型' },
  { value: 9, label: '药品.毒性' },
  { value: 10, label: '药品.名称' }
];

const ParentReslut = ({ title }: { title: string }) => (
  <>
    <div className='text-sm mb-2'>节点判断</div>
    <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>
      {title}
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
  </>
);

const Step2: React.FC<SiderBarProps> = ({
  selectedNode,
  parentNode,
  onFinish
}) => {
  const [relationOptons, setRelationOptons] = useState(relationOptons2);
  // 0: 属于-字典 1: 属于-关键字 2: 匹配 3: 为空 4:等于/不等于
  const [condition, setCondition] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [desc, setDesc] = useState('');

  const [form] = Form.useForm();

  const onValuesChange = (changedValues: any, values: any) => {
    const curKey = Object.keys(changedValues)[0];
    const keys = ['title', 'relation', 'key', 'ret'];
    const index = keys.findIndex((key) => key === curKey);
    const needReset = keys.slice(index + 1);
    form.resetFields(needReset);

    setDesc(
      `${form.getFieldValue('title')} ${form.getFieldValue('relation')} ${form.getFieldValue('ret')}`
    );

    if (Number(changedValues.title)) {
      setRelationOptons(
        changedValues.title === 1 || changedValues.title === 10
          ? relationOptons2
          : relationOptons1
      );
      setCondition(0);
    }

    if (Number(changedValues.key)) {
      setCondition(changedValues.key === 1 ? 0 : 1);
    }

    if (Number(changedValues.relation)) {
      const getStatus = () => {
        switch (changedValues.relation) {
          case 1:
            return 0;
          case 2:
            return 0;
          case 3:
            return 2;
          case 4:
            return 3;
          case 5:
            return 4;
          default:
            return 0;
        }
      };
      setCondition(getStatus());
    }
  };

  return (
    <div>
      <div className='pb-2'>节点详情</div>
      <Form
        clearOnDestroy
        form={form}
        onFinish={(values) => {
          onFinish({ step: 2, values });
        }}
        onValuesChange={onValuesChange}
      >
        {selectedNode?.data.metadata.type === 'node' && (
          <ParentReslut title={parentNode?.data.title} />
        )}
        <div className='text-sm mb-2'>节点设置</div>
        <Form.Item name='title' initialValue={1}>
          <Select placeholder='请选择' options={determineTargetOptions} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name='relation' initialValue={1}>
              <Select placeholder='请选择' options={relationOptons} />
            </Form.Item>
          </Col>
          <Col span={12}>
            {(condition === 0 || condition === 1) && (
              <Form.Item name='key' initialValue={1}>
                <Select
                  placeholder='请选择'
                  options={[
                    { value: 1, label: '字典' },
                    { value: 2, label: '关键字' }
                  ]}
                />
              </Form.Item>
            )}

            {condition === 2 && (
              <Form.Item name='ret'>
                <Input className='mb-2' placeholder='请输入' />
              </Form.Item>
            )}

            {condition === 4 && (
              <Form.Item name='ret'>
                <Select placeholder='请选择' options={determineTargetOptions} />
              </Form.Item>
            )}
          </Col>
        </Row>
        {(condition === 0 || condition === 1) && (
          <Form.Item name='ret'>
            {condition ? (
              <Input placeholder='请输入' />
            ) : (
              <Select
                allowClear
                mode='multiple'
                placeholder='请选择'
                options={[
                  { value: 1, label: ', kbk' },
                  { value: 2, label: 'jbjbbjjb' }
                ]}
              />
            )}
          </Form.Item>
        )}
        <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>
          <div className='font-semibold'>整体判断描述：</div>
          {desc}
        </div>
        <Form.Item>
          <Button type='primary' block htmlType='submit'>
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Step2;
