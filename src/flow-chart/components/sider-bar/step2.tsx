import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  Form,
  Input,
  message,
  Select,
  Row,
  Col,
  Radio,
  Modal,
  Transfer,
  Tree,
  Spin,
  InputNumber
} from 'antd';
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
  const [flatDiseaseOpts, setFlatDiseaseOpts] = useState<Option[]>([]);
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

  const { isFetching, error } = useQuery(
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

  const { mutate, isLoading } = useMutation(getCategorys, {
    onSuccess({ data }) {
      serResultOpts(data.data);
      const flatDiseaseOpts: Option[] = [];
      const transferFlatDisease = (diseases: any) => {
        for (let i = 0; i < diseases.length; i++) {
          const curDisease = diseases[i];
          if (curDisease.children) {
            const { children, ...restDisease } = curDisease;
            flatDiseaseOpts.push(restDisease);
            transferFlatDisease(children);
          } else {
            flatDiseaseOpts.push(curDisease);
          }
        }
      };
      transferFlatDisease(data.data);
      setFlatDiseaseOpts(flatDiseaseOpts);
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
    ...flatDiseaseOpts,
    ...contrastOpts,
    ...resultOpts,
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

    console.log(changedValues, 'KKKKK');

    if (changedValues.connSign) {
      setRelationType(changedValues.connSign);
      setOperationType('dict');
    }

    if (values.checkParam === 'age') return;
    if (values.checkParam === 'perDose') return;

    // 重置当前修改Form.Item后面的值
    console.log(changedValues, '---');
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
        <TransferTree
          keys={form.getFieldValue('paramVal')}
          ref={transferTreeRef}
          dataSource={resultOpts as TransferData[]}
        />
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
        <TransferTable
          ref={transferTableRef}
          keys={form.getFieldValue('paramVal')}
          dataSource={resultOpts as TransferData[]}
        />
      </Modal>
      <Spin
        // spinning={isFetching || isLoading || getDrugMutation.isLoading}
        spinning={false}
      >
        <div className='pb-2'>节点详情</div>
        <Form
          clearOnDestroy
          form={form}
          onFinish={(values) => {
            if (values.ages) {
              if (values?.ages?.filter((age: any) => age.paramVal === null).length)
                return message.error('请填写完整节点数据');
            } else {
              if (
                (!values.paramVal ||
                  (Array.isArray(values.paramVal) && values.paramVal.length === 0) ||
                  (typeof values.paramVal === 'string' && values.paramVal.trim() === '')) &&
                values.connSign !== 'isnull'
              )
                return message.error('请填写完整节点数据');
            }

            if (values.checkParam === 'age') {
              let title = '年龄';
              values.ages.forEach((age: any) => {
                title += ` ${descMapping[age.connSign]} ${age.paramVal} ${descMapping[age.specialParam]} ${age.checkSign === 'ignore' ? '' : descMapping[age.checkSign]}`;
              });
              return onFinish({ step: 2, values, title });
            }

            const paramVal = values.paramVal;
            const desc1 = descMapping[values.checkParam];
            const desc2 = descMapping[values.connSign] ?? '';
            const desc3 =
              (Array.isArray(paramVal)
                ? paramVal.map((i) => descMapping[i]).join('，')
                : relationType === 'eq'
                  ? descMapping[paramVal]
                  : paramVal) ?? '';
            const describe = `${desc1} ${desc2} ${desc3}`;
            setDesc(describe);

            if (selectedCategory === 'pathogen') {
              const labels = flatDiseaseOpts
                .filter(({ value }) => paramVal.includes(value))
                .map(({ label }) => label);
              return onFinish({
                step: 2,
                values: { ...values, paramValLabel: labels },
                title: describe
              });
            }

            if (
              ![
                'specialBoilType',
                'age',
                'perDose',
                'dailyDose',
                'pathogen'
                // 'medicineName'
              ].includes(selectedCategory)
            ) {
              const labels = resultOpts
                .filter(({ value }) => paramVal?.includes(value))
                .map(({ label }) => label);
              return onFinish({
                step: 2,
                values: { ...values, paramValLabel: labels },
                title: describe
              });
            }

            console.log(values, describe, '??????');
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
            <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2 break-words'>
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
                                { label: 'g', value: 'g' },
                                {
                                  label: 'kg',
                                  value: 'kg'
                                }
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      </>
                      <Col span={24}>
                        <Form.Item {...restField} name={[name, 'checkSign']} initialValue='ignore'>
                          <Select
                            options={logicOpts}
                            onChange={(val) => val !== 'ignore' && add()}
                          />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                </>
              )}
            </Form.List>
            {operationType}
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
                          <InputNumber min={0} placeholder='请输入' />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'specialParam']} initialValue='day'>
                          <Select options={timeOpts} />
                        </Form.Item>
                      </Col>
                      <Col span={24}>
                        <Form.Item {...restField} name={[name, 'checkSign']} initialValue='ignore'>
                          <Select
                            options={logicOpts}
                            onChange={(val) => val !== 'ignore' && add()}
                          />
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
      </Spin>
    </div>
  );
};

const ParentReslut = ({ title }: { title: string }) => (
  <>
    <div className='text-sm mb-2'>节点判断</div>
    <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2 break-words'>
      {title}
    </div>
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
