import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { FlowViewNode } from '@ant-design/pro-flow';
import type { SiderBarProps } from './index';
import { useMutation } from 'react-query';
import { getDecideTargets, type DecideTargets } from '@services/index';

const relationOptons1 = [
  { value: 'in', label: '属于' },
  { value: '!in', label: '不属于' },
  { value: 'like', label: '匹配' },
  { value: 'isnull', label: '为空' }
];

const relationOptons2 = [...relationOptons1, { value: 'eq', label: '等于' }];

const ParentReslut = ({ title }: { title: string }) => (
  <>
    <div className='text-sm mb-2'>节点判断</div>
    <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>{title}</div>
    <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
    <Form.Item name='sourceResult' noStyle initialValue={1}>
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
  </>
);

const Step2: React.FC<
  SiderBarProps & { decideTargetOptions: { label: string; value: string }[] }
> = ({ selectedNode, parentNode, onFinish, decideTargetOptions }) => {
  const [paramValOptions, setParamValOptions] = useState<{ label: string; value: string }[]>([]);
  const [relationOptons, setRelationOptons] = useState(relationOptons2);
  // 0: 属于-字典 1: 属于-关键字 2: 匹配 3: 为空 4:等于/不等于
  const [condition, setCondition] = useState<0 | 1 | 2 | 3 | 4>(0);
  const [desc, setDesc] = useState('');

  const [form] = Form.useForm();

  const { mutate } = useMutation(getDecideTargets, {
    onSuccess(res) {
      setParamValOptions(res.data.data);
    }
  });

  const onValuesChange = (changedValues: any, values: any) => {
    const curKey = Object.keys(changedValues)[0];
    const keys = ['checkParam', 'connSign', 'descParam', 'paramVal'];
    const index = keys.findIndex((key) => key === curKey);
    const needReset = keys.slice(index + 1);
    form.resetFields(needReset);

    setDesc(
      `${form.getFieldValue('checkParam')} ${form.getFieldValue('connSign')} ${form.getFieldValue('paramVal')}`
    );

    if (changedValues.checkParam) {
      setRelationOptons(
        changedValues.checkParam === 'specialBoilType' ||
          changedValues.checkParam === 'medicineName'
          ? relationOptons2
          : relationOptons1
      );
      setCondition(0);
    }

    if (changedValues.descParam) {
      setCondition(changedValues.descParam === 'dict' ? 0 : 1);
    }

    if (changedValues.connSign) {
      const getStatus = () => {
        switch (changedValues.connSign) {
          case 'in':
            return 0;
          case '!in':
            return 0;
          case 'like':
            return 2;
          case 'isnull':
            return 3;
          case 'eq':
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
        <Form.Item name='checkParam' initialValue={'specialBoilType'}>
          <Select placeholder='请选择' options={decideTargetOptions} />
        </Form.Item>
        <Row gutter={12}>
          <Col span={12}>
            <Form.Item name='connSign' initialValue={'in'}>
              <Select placeholder='请选择' options={relationOptons} />
            </Form.Item>
          </Col>
          <Col span={12}>
            {(condition === 0 || condition === 1) && (
              <Form.Item name='descParam' initialValue={'dict'}>
                <Select
                  placeholder='请选择'
                  options={[
                    { value: 'dict', label: '字典' },
                    { value: 'word', label: '关键字' }
                  ]}
                />
              </Form.Item>
            )}

            {condition === 2 && (
              <Form.Item name='paramVal'>
                <Input className='mb-2' placeholder='请输入' />
              </Form.Item>
            )}

            {condition === 4 && (
              <Form.Item name='paramVal'>
                <Select placeholder='请选择' options={decideTargetOptions} />
              </Form.Item>
            )}
          </Col>
        </Row>
        {(condition === 0 || condition === 1) && (
          <Form.Item name='paramVal'>
            {condition ? (
              <Input placeholder='请输入' />
            ) : (
              <Select
                allowClear
                mode='multiple'
                placeholder='请选择'
                options={paramValOptions}
                onDropdownVisibleChange={(open) => {
                  open === true && mutate(form.getFieldValue('checkParam'));
                }}
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
