import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio } from 'antd';
import { useMutation, useQuery } from 'react-query';

import type { SiderBarProps } from './';

import {
  type Option,
  relationOpts1,
  relationOpts2,
  contrastOpts,
  timeOpts,
  logicOpts
} from './utils';
import { getCategorys, type DecideTargets } from '@services/index';

const Step2: React.FC<
  SiderBarProps & { decideTargetOptions: { label: string; value: string }[] }
> = ({ selectedNode, parentNode, onFinish, decideTargetOptions }) => {
  const [categoryOpts, setCategoryOpts] = useState<Option[]>([]);
  /////////////////////////
  const [paramValOptions, setParamValOptions] = useState<{ label: string; value: string }[]>([]);
  const [relationOptons, setRelationOptons] = useState(relationOpts2);
  // 0: 属于-字典 1: 属于-关键字 2: 匹配 3: 为空 4:等于/不等于
  const [condition, setCondition] = useState<'in' | '!in' | 'like' | 'isnull' | 'eq'>('in');
  const [desc, setDesc] = useState('');
  const [descParam, setDescParam] = useState<'desc' | 'word'>('desc');
  const [checkParam, setCheckParam] = useState('specialBoilType');
  const [is, setIs] = useState<'default' | 'age' | 'num'>('default');

  const [form] = Form.useForm();

  const { data, isLoading, error } = useQuery(
    ['getCategorys'],
    () => getCategorys('ruleNodeCheckParam'),
    {
      onSuccess(res) {
        console.log(res, '*****');
      }
    }
  );

  const map: Record<string, any> = {};
  [
    ...relationOpts2,
    ...decideTargetOptions,
    ...paramValOptions,
    ...contrastOpts,
    ...timeOpts,
    ...logicOpts
  ].forEach((item) => {
    map[item.value] = item.label;
  });

  useEffect(() => {
    if (selectedNode?.data.jsonData) {
      form.setFieldsValue(selectedNode?.data.jsonData);
      setDescParam(selectedNode?.data.jsonData?.descParam || 'desc');
      setDesc(selectedNode?.data.jsonData?.title);
      mutate(form.getFieldValue('checkParam'));
      setCheckParam(form.getFieldValue('checkParam'));
    } else {
      form.resetFields();
      setDesc('');
    }
  }, [selectedNode?.id]);

  const { mutate } = useMutation(getCategorys, {
    onSuccess(res) {
      setParamValOptions(res.data.data);
    }
  });

  const onValuesChange = (changedValues: any, values: any) => {
    if (changedValues.sourceResult) return;

    if (changedValues.checkParam) {
      switch (changedValues.checkParam) {
        case 'age':
          return setIs('age');
        case 'perDose':
          return setIs('num');

        default:
          return setIs('default');
      }
    }

    if (values.checkParam === 'age') return;

    const paramVal = form.getFieldValue('paramVal');
    const de1 = map[form.getFieldValue('checkParam')];
    const de2 = map[form.getFieldValue('connSign')];
    const de3 = (Array.isArray(paramVal) ? paramVal.map((i) => map[i]).join('，') : paramVal) || '';

    setDesc(`${de1} ${de2} ${de3}`);

    const curKey = Object.keys(changedValues)[0];
    const keys = ['checkParam', 'connSign', 'descParam', 'paramVal'];
    const index = keys.findIndex((key) => key === curKey);
    const needReset = keys.slice(index + 1);
    form.resetFields(needReset);

    if (changedValues.checkParam) {
      setRelationOptons(
        changedValues.checkParam === 'specialBoilType' ||
          changedValues.checkParam === 'medicineName'
          ? relationOpts2
          : relationOpts1
      );
      setCondition('in');
      setDescParam('desc');
      setCheckParam(changedValues.checkParam);
    }

    if (changedValues.descParam) {
      setCondition(changedValues.descParam === 'dict' ? 'in' : '!in');
      setDescParam(changedValues.descParam);
    }

    if (changedValues.connSign) {
      setCondition(changedValues.connSign);
      setDescParam('desc');
    }
  };

  return (
    <div>
      <div className='pb-2'>节点详情 {is}</div>
      <Form
        clearOnDestroy
        form={form}
        onFinish={(values) => {
          console.log(values);
          if (values.checkParam === 'age') {
            let title = '年龄';
            values.ages.forEach((age) => {
              title += ` ${map[age.connSign]} ${age.paramVal} ${map[age.specialParam]} ${age.checkSign === 'ignore' ? '' : map[age.checkSign]}`;
            });
            onFinish({ step: 2, values: { ...values, title } });
            return;
          }

          if (values.connSign !== 'isnull' && !values.paramVal) {
            return message.error('请填写完整节点数据');
          }

          onFinish({ step: 2, values: { ...values, title: desc } });
        }}
        onValuesChange={onValuesChange}
      >
        {selectedNode?.data.type === 'node' && <ParentReslut title={parentNode?.data.title} />}
        <div className='text-sm mb-2'>节点设置</div>
        <Form.Item name='checkParam' initialValue={'specialBoilType'}>
          <Select placeholder='请选择' options={decideTargetOptions} />
        </Form.Item>
        {is === 'default' && (
          <>
            {checkParam !== 'toxicPieces' && (
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item name='connSign' initialValue={'in'}>
                    <Select placeholder='请选择' options={relationOptons} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  {(condition === 'in' || condition === '!in') && (
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

                  {condition === 'like' && (
                    <Form.Item name='paramVal'>
                      <Input className='mb-2' placeholder='请输入' />
                    </Form.Item>
                  )}

                  {condition === 'eq' && (
                    <Form.Item name='paramVal'>
                      <Select placeholder='请选择' options={decideTargetOptions} />
                    </Form.Item>
                  )}
                </Col>
              </Row>
            )}
            {(condition === 'in' || condition === '!in') && (
              <Form.Item name='paramVal'>
                {descParam === 'word' ? (
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
          </>
        )}
        {is === 'num' && 'num'}

        {is === 'age' && (
          <Form.List
            name='ages'
            initialValue={[
              {
                connSign: 'gt',
                specialParam: 'day',
                checkSign: 'ignore'
              }
            ]}
          >
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ name, key, ...restField }, index) => (
                  <Row gutter={12} key={key}>
                    <Col span={9}>
                      <Form.Item {...restField} name={[name, 'connSign']} initialValue='gt'>
                        <Select options={contrastOpts} />
                      </Form.Item>
                    </Col>
                    <Col span={9}>
                      <Form.Item {...restField} name={[name, 'paramVal']} initialValue={1}>
                        <Input placeholder='请输入' />
                      </Form.Item>
                    </Col>
                    <Col span={6}>
                      <Form.Item {...restField} name={[name, 'specialParam']} initialValue='day'>
                        <Select options={timeOpts} />
                      </Form.Item>
                    </Col>
                    <Col span={24}>
                      <Form.Item {...restField} name={[name, 'checkSign']} initialValue='ignore'>
                        <Select options={logicOpts} onChange={(val) => val !== 'ignore' && add()} />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>
        )}
        <Form.Item>
          <Button type='primary' block htmlType='submit'>
            确认
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

const ParentReslut = ({ title }: { title: string }) => (
  <>
    <div className='text-sm mb-2'>节点判断</div>
    <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>{title}</div>
    <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
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
  </>
);

export default Step2;
