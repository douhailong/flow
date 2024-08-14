import React, { useEffect, useRef, useState } from 'react';
import { Button, Form, Input, message, Select, Row, Col, Radio, Modal, Transfer, Tree } from 'antd';
import type { GetProp, TransferProps, TreeDataNode } from 'antd';
import { useMutation, useQuery } from 'react-query';

import TransferTree from './transfer-tree';
import TransferTable from './transfer-table';

import type { TransferData } from './transfer-tree';
import type { SiderBarProps } from './';
import {
  type Option,
  type CategoryType,
  type RelationType,
  relationOpts1,
  relationOpts2,
  contrastOpts,
  timeOpts,
  logicOpts
} from './utils';
import { getCategorys, getDrugs, type GetCategory } from '@services';
import clsx from 'clsx';

const Step2: React.FC<SiderBarProps> = ({ selectedNode, parentNode, onFinish }) => {
  const [categoryOpts, setCategoryOpts] = useState<Option[]>([]);
  const [resultOpts, serResultOpts] = useState<Option[]>([]);
  const [relationOpts, setRelationOpts] = useState(relationOpts2);
  const [categoryType, setCategoryType] = useState<CategoryType>('default');
  const [relationType, setRelationType] = useState<RelationType>('in');
  const [operationType, setOperationType] = useState<'dict' | 'word'>('dict');
  const [desc, setDesc] = useState('');
  const [isOpenTree, setIsOpenTree] = useState(false);
  const [isOpenTable, setIsOpenTable] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState('specialBoilType');

  const [form] = Form.useForm();
  const transferTreeRef = useRef<any>(null);
  const transferTableRef = useRef<any>(null);

  const { isLoading, error } = useQuery(
    ['getCategorys'],
    () => getCategorys('ruleNodeCheckParam'),
    {
      onSuccess({ data }) {
        const opts = data.data
          .reduce(
            (pre, cur) => (cur.children ? [...pre, ...cur.children] : [...pre, cur]),
            [] as GetCategory[]
          )
          .map(({ label, value }) => ({ label, value }));

        setCategoryOpts(opts);
      }
    }
  );

  const { mutate } = useMutation(getCategorys, {
    onSuccess({ data }) {
      serResultOpts(data.data);
    }
  });

  const getDrugMutation = useMutation(getDrugs, {
    onSuccess({ data }) {
      // TODO
      const opts = data.data.map(({ id, medicineName, medicineCode }) => ({
        label: medicineName,
        value: id,
        title: medicineCode,
        key: id
      }));
      serResultOpts(opts);
    }
  });

  const descMapping: Record<string, string> = {};
  [
    ...relationOpts2,
    ...categoryOpts,
    ...resultOpts,
    ...contrastOpts,
    ...timeOpts,
    ...logicOpts
  ].forEach(({ value, label }) => {
    descMapping[value] = label;
  });

  useEffect(() => {
    const nodeData = selectedNode?.data;

    if (nodeData?.jsonData) {
      form.setFieldsValue(nodeData?.jsonData);
      const val = form.getFieldValue('checkParam');
      setOperationType(nodeData?.jsonData?.descParam);
      setDesc(nodeData.title);
      onSwitchCategoryType(val);
      setSelectedCategory(val);
      setRelationType(form.getFieldValue('connSign'));
      val === 'medicineName' ? getDrugMutation.mutate() : mutate(val);
    } else {
      setDesc('');
      mutate('specialBoilType');
      form.resetFields();
    }
    onSwitchCategoryType(form.getFieldValue('checkParam'));
  }, [selectedNode?.id]);

  const onSwitchCategoryType = (val: string) => {
    switch (val) {
      case 'age':
        return setCategoryType('age');
      case 'perDose':
        return setCategoryType('num');
      default:
        return setCategoryType('default');
    }
  };

  const onValuesChange = (changedValues: any, values: any) => {
    if (changedValues.sourceResult) return;

    if (changedValues.checkParam) {
      const val = changedValues.checkParam;
      const opts = ['specialBoilType', 'medicineName'].includes(val)
        ? relationOpts2
        : relationOpts1;
      setRelationOpts(opts);
      setRelationType('in');
      setOperationType('dict');
      setSelectedCategory(val);
      setDesc('');
      val === 'medicineName' ? getDrugMutation.mutate() : mutate(val);
      onSwitchCategoryType(val);
    }

    if (changedValues.descParam) {
      setRelationType(changedValues.descParam === 'dict' ? 'in' : '!in');
      setOperationType(changedValues.descParam);
    }

    if (changedValues.connSign) {
      console.log(changedValues.connSign, 'changedValues.descParam');

      setRelationType(changedValues.connSign);
      setOperationType('dict');
    }

    if (values.checkParam === 'age') return;

    // 重置当前修改Form.Item后面的值
    const curKey = Object.keys(changedValues)[0];
    const keys = ['checkParam', 'connSign', 'descParam', 'paramVal'];
    const index = keys.findIndex((key) => key === curKey);
    form.resetFields(keys.slice(index + 1));
  };

  return (
    <div>
      <Modal
        maskClosable={false}
        destroyOnClose
        width={1000}
        open={isOpenTree}
        title='诊断名称选择'
        onOk={() => {
          form.setFieldValue('paramVal', transferTreeRef.current?.onOk());
          transferTreeRef.current?.onClear();
          setIsOpenTree(false);
        }}
        onCancel={() => {
          setIsOpenTree(false);
          transferTreeRef.current?.onCancel();
        }}
      >
        {/* <div className='max-h-96 overflow-y-auto'> */}
        <TransferTree
          keys={form.getFieldValue('paramVal')}
          ref={transferTreeRef}
          dataSource={resultOpts as TransferData[]}
        />
        {/* </div> */}
      </Modal>
      <Modal
        maskClosable={false}
        destroyOnClose
        width={1000}
        open={isOpenTable}
        title='药品选择'
        onOk={() => {
          form.setFieldValue('paramVal', transferTableRef.current?.onOk());
          transferTableRef.current?.onClear();
          setIsOpenTable(false);
        }}
        onCancel={() => {
          setIsOpenTable(false);
          transferTableRef.current?.onCancel();
        }}
      >
        {/* <div className='max-h-96 overflow-y-auto'> */}
        <TransferTable
          ref={transferTableRef}
          keys={form.getFieldValue('paramVal')}
          dataSource={resultOpts as TransferData[]}
        />
        {/* </div> */}
      </Modal>
      <div className='pb-2'>节点详情</div>
      <Form
        clearOnDestroy
        form={form}
        onFinish={(values) => {
          // if (
          //   values.connSign !== 'isnull' &&
          //   !values.paramVal &&
          //   values.checkParam !== 'age' &&
          //   values.checkParam !== 'perDose'
          // ) {
          //   return message.error('请填写完整节点数据');
          // }

          if (values.checkParam === 'age') {
            let title = '年龄';
            values.ages.forEach((age: any) => {
              title += ` ${descMapping[age.connSign]} ${age.paramVal} ${descMapping[age.specialParam]} ${age.checkSign === 'ignore' ? '' : descMapping[age.checkSign]}`;
            });
            return onFinish({ step: 2, values, title });
          }

          const paramVal = form.getFieldValue('paramVal');
          const desc1 = descMapping[form.getFieldValue('checkParam')];
          const desc2 = descMapping[form.getFieldValue('connSign')];
          const desc3 =
            (Array.isArray(paramVal) ? paramVal.map((i) => descMapping[i]).join('，') : paramVal) ??
            '';
          const describe = `${desc1} ${desc2} ${desc3}`;
          setDesc(describe);

          // if (selectedCategory === 'pathogen') {
          //   const transferResultOpts = (opts: any) => {
          //     const result = [];
          //     for (let i = 0; i < opts.length; i++) {
          //       const curOp = opts[i];

          //       if (curOp.children) {
          //         const { children, ...restCurOp } = curOp;
          //         result.push(transferResultOpts(children));
          //       } else {
          //         result.push(curOp);
          //       }
          //     }
          //     return result;
          //   };
          //   console.log('******', transferResultOpts(resultOpts));
          //   console.log('******', resultOpts);

          //   onFinish({ step: 2, values: { ...values }, title: describe });
          // }
          onFinish({ step: 2, values, title: describe });
        }}
        onValuesChange={onValuesChange}
      >
        <Colation show={selectedNode.data.type === 'node'}>
          <ParentReslut title={parentNode?.data.title} />
        </Colation>
        <div className='text-sm mb-2'>节点设置</div>
        <Form.Item name='checkParam' initialValue='specialBoilType'>
          <Select options={categoryOpts} />
        </Form.Item>
        <Colation show={categoryType === 'default'}>
          <Colation show={selectedCategory !== 'toxicPieces'}>
            <Row gutter={12}>
              <Col span={12}>
                <Form.Item name='connSign' initialValue='in'>
                  <Select placeholder='请选择' options={relationOpts} />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Colation show={['in', '!in'].includes(relationType)}>
                  <Form.Item name='descParam' initialValue='dict'>
                    <Select
                      placeholder='请选择'
                      options={[
                        { value: 'dict', label: '字典' },
                        { value: 'word', label: '关键字' }
                      ]}
                    />
                  </Form.Item>
                </Colation>

                <Colation show={relationType === 'like'}>
                  <Form.Item name='paramVal'>
                    <Input className='mb-2' placeholder='请输入' />
                  </Form.Item>
                </Colation>

                <Colation show={relationType === 'eq'}>
                  <Form.Item name='paramVal'>
                    <Select placeholder='请选择' options={categoryOpts} />
                  </Form.Item>
                </Colation>
              </Col>
            </Row>
          </Colation>
          <Colation show={['in', '!in'].includes(relationType)}>
            <Form.Item
              className={clsx(
                (operationType === 'word' ||
                  !['pathogen', 'medicineName'].includes(selectedCategory)) &&
                  'hidden'
              )}
            >
              <Input
                placeholder='请选择'
                onChange={() => undefined}
                onClick={() =>
                  selectedCategory === 'pathogen' ? setIsOpenTree(true) : setIsOpenTable(true)
                }
                value={
                  form.getFieldValue('paramVal')?.length
                    ? `${descMapping.pathogen}已选${form.getFieldValue('paramVal')?.length}项`
                    : ''
                }
              />
            </Form.Item>
            <Form.Item
              name='paramVal'
              className={clsx(
                ['pathogen', 'medicineName'].includes(selectedCategory) &&
                  operationType !== 'word' &&
                  'hidden'
              )}
            >
              {operationType === 'word' ? (
                <Input placeholder='请输入' />
              ) : (
                <Select allowClear mode='multiple' placeholder='请选择' options={resultOpts} />
              )}
            </Form.Item>
          </Colation>
          <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2'>
            <div className='font-semibold'>整体判断描述：</div>
            {desc}
          </div>
        </Colation>
        <Colation show={categoryType === 'num'}>
          <Form.List
            name='nums'
            initialValue={[
              {
                connSign: 'gt',
                specialParam: 'g',
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
                    <Col span={15}>
                      <Form.Item {...restField} name={[name, 'descParam']} initialValue='num'>
                        <Select
                          options={[
                            { label: '数值', value: 'num' },
                            {
                              label: '常规剂量每次上限',
                              value: 'ceil'
                            }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                    <>
                      <Col span={15}>
                        <Form.Item {...restField} name={[name, 'paramVal']}>
                          <Input placeholder='请输入' />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item {...restField} name={[name, 'specialParam']} initialValue='g'>
                          <Select
                            options={[
                              { label: 'g', value: 1 },
                              {
                                label: 'kg',
                                value: 2
                              }
                            ]}
                          />
                        </Form.Item>
                      </Col>
                    </>
                    <Col span={24}>
                      {operationType}
                      <Form.Item {...restField} name={[name, 'checkSign']} initialValue='ignore'>
                        <Select options={logicOpts} onChange={(val) => val !== 'ignore' && add()} />
                      </Form.Item>
                    </Col>
                  </Row>
                ))}
              </>
            )}
          </Form.List>
        </Colation>
        <Colation show={categoryType === 'age'}>
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
        </Colation>
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

type ColationProps = { show: boolean; children: React.ReactNode };

const Colation = ({ show, children }: ColationProps) => (show ? children : null);

export default Step2;
