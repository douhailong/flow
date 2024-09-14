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
  ceilOpts1,
  ceilOpts2,
  logicOpts
} from './utils';
import { getCategorys, getDrugs, type GetCategory } from '@services';
import clsx from 'clsx';
import { validAges } from './valid-ages';

const opts1: Option[] = [
  { label: '筛选后药品', value: '1' },
  { label: '全部药品', value: '2' }
];

const Step2: React.FC<SiderBarProps> = ({ selectedNode, parentNode, onFinish, nextNodes }) => {
  const [categoryOpts, setCategoryOpts] = useState<Option[]>([]);
  const [flatDiseaseOpts, setFlatDiseaseOpts] = useState<Option[]>([]);
  const [resultOpts, serResultOpts] = useState<Option[]>([]);
  const [relationOpts, setRelationOpts] = useState(relationOpts2);
  const [ceilOpts, setCeilOpts] = useState(ceilOpts1);
  const [categoryType, setCategoryType] = useState<CategoryType>('default');
  const [relationType, setRelationType] = useState<RelationType>('in');
  const [operationType, setOperationType] = useState<'dict' | 'word'>('dict');
  const [operationTypes, setOperationTypes] = useState<
    ('num' | 'dayCeil' | 'ceil' | 'minDoseCeil')[]
  >(['num']);
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
    ...ceilOpts2,
    ...[
      { label: 'g', value: 'g' },
      {
        label: 'kg',
        value: 'kg'
      }
    ],
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

      const aa = nodeData?.jsonData?.nums || nodeData?.jsonData?.ages || [];
      const operats = aa.map((num: any) => num?.descParam ?? 'num');
      setOperationTypes(operats);
      val === 'dailyDose' ? setCeilOpts(ceilOpts2) : setCeilOpts(ceilOpts1);
      val === 'medicineName' ? getDrugMutation.mutate() : mutate(val);
    } else {
      setDesc('');
      mutate('specialBoilType');
      form.resetFields();
      setOperationType('dict');
      setRelationType('in');
      setSelectedCategory('specialBoilType');
    }
    onSwitchCategoryType(form.getFieldValue('checkParam'));
    setRelationOpts(
      form.getFieldValue('checkParam') === 'specialBoilType' ? relationOpts2 : relationOpts1
    );
  }, [selectedNode?.id]);

  const onSwitchCategoryType = (val: string) => {
    switch (val) {
      case 'age':
        return setCategoryType('age');
      case 'perDose':
        return setCategoryType('num');
      case 'dailyDose':
        return setCategoryType('num');
      default:
        return setCategoryType('default');
    }
  };

  const onValuesChange = (changedValues: any, values: any) => {
    if (changedValues.sourceResult) return;

    if (!values.nums) setOperationTypes(['num']);

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
      setRelationType(changedValues.connSign);
      setOperationType('dict');
    }

    if (values.checkParam === 'perDose') setCeilOpts(ceilOpts1);
    if (values.checkParam === 'dailyDose') setCeilOpts(ceilOpts2);

    if (!changedValues.nums && !changedValues.ages) form.resetFields(['ages', 'nums']);

    const operats = form.getFieldValue('nums')?.map((num: any) => num?.descParam ?? 'num');
    setOperationTypes(operats || ['num']);

    if (values.checkParam === 'age') return;
    if (values.checkParam === 'perDose') return;
    if (values.checkParam === 'dailyDose') return;
    if (changedValues.medNameFilterType) return;

    // 重置当前修改Form.Item后面的值
    const curKey = Object.keys(changedValues)?.[0];
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
      <Spin spinning={isFetching || isLoading || getDrugMutation.isLoading}>
        <div className='pb-2'>节点详情</div>
        <Form
          clearOnDestroy
          form={form}
          onFinish={(values) => {
            if (
              values.checkParam === 'medicineName' &&
              parentNode?.data.title.includes('全部药品') &&
              values.sourceResult === 'F'
            ) {
              return message.error('全部药品的药品名称子节点判断条件不能为否');
            }

            if (values.nums) {
              if (
                values?.nums?.filter(
                  (num: any) => num.paramVal === null || num.paramVal === undefined
                ).length
              )
                return message.error('请填写完整节点数据');
            } else if (values.ages) {
              if (
                values?.ages?.filter(
                  (age: any) => age.paramVal === null || age.paramVal === undefined
                ).length
              )
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
                title += ` ${!age.checkSign || age.checkSign === 'ignore' ? '' : descMapping[age.checkSign]} ${descMapping[age.connSign]} ${age.paramVal}${descMapping[age.specialParam]}`;
              });
              return onFinish({ step: 2, values, title });
            }

            if (values.checkParam === 'perDose' || values.checkParam === 'dailyDose') {
              let title = selectedCategory === 'perDose' ? '每次剂量' : '每天剂量';
              values.nums.forEach((num: any) => {
                title += ` ${!num.checkSign || num.checkSign === 'ignore' ? '' : descMapping[num.checkSign]} ${descMapping[num.connSign]} ${descMapping[num.descParam]} ${num.paramVal}${num.descParam === 'num' ? num.specialParam : '倍'}`;
              });
              return onFinish({ step: 2, values, title });
            }

            const paramVal = values.paramVal;
            const desc1 = descMapping[values.checkParam];
            const desc2 = descMapping[values.connSign] ?? '';
            const desc4 = values.medNameFilterType
              ? values.medNameFilterType === '1'
                ? '筛选后药品'
                : '全部药品'
              : '';
            const desc3 =
              (Array.isArray(paramVal)
                ? paramVal.map((i) => descMapping[i]).join('，')
                : relationType === 'eq'
                  ? descMapping[paramVal]
                  : paramVal) ?? '';
            const describe = `${desc1} ${desc2} ${desc3} ${desc4}`;
            setDesc(describe);

            const fined = nextNodes?.find(
              (next) => next.data.checkParam === 'medicineName' && next.data.sourceResult === 'F'
            );

            if (
              values.checkParam === 'medicineName' &&
              describe.includes('全部药品') &&
              values.sourceResult === 'T' &&
              fined
            ) {
              return message.error('全部药品的药品名称子节点判断条件不能为否');
            }

            if (selectedCategory === 'pathogen') {
              const labels = flatDiseaseOpts
                .filter(({ value }) => paramVal?.includes(value))
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

            onFinish({ step: 2, values, title: describe });
          }}
          onValuesChange={onValuesChange}
        >
          {/* <Colation show={selectedNode.data.type === 'node'}> */}
          <ParentReslut title={parentNode?.data.title} type={selectedNode?.data.type} />
          {/* </Colation> */}
          <div className='text-sm mb-2'>节点设置</div>
          <Form.Item name='checkParam' initialValue='specialBoilType'>
            <Select options={categoryOpts} />
          </Form.Item>
          <Colation show={categoryType === 'default'}>
            <Colation
              show={
                selectedCategory !== 'toxicPieces' &&
                selectedCategory !== 'doubleSign' &&
                selectedCategory !== 'pregnantSign'
              }
            >
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
                      <Select
                        placeholder='请选择'
                        options={
                          selectedCategory !== 'medicineName'
                            ? categoryOpts
                            : ([
                                {
                                  code: 'ruleNodeCheckParam',
                                  value: 'medicineName',
                                  label: '药品·名称',
                                  seq: 11,
                                  ext1: 'drug'
                                }
                              ] as any as Option[])
                        }
                      />
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
            {selectedCategory === 'medicineName' && (
              <Form.Item name='medNameFilterType' initialValue='1'>
                <Select options={opts1} />
              </Form.Item>
            )}
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
                  specialParam: 'g'
                }
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ name, key, ...restField }, index) => (
                    <Row gutter={12} key={key}>
                      {index !== 0 && (
                        <Col span={24}>
                          <Form.Item {...restField} name={[name, 'checkSign']} initialValue='and'>
                            <Select
                              options={logicOpts}
                              onChange={(val) => val === 'ignore' && remove(index)}
                            />
                          </Form.Item>
                        </Col>
                      )}
                      <Col span={9}>
                        <Form.Item {...restField} name={[name, 'connSign']} initialValue='gt'>
                          <Select options={contrastOpts} />
                        </Form.Item>
                      </Col>
                      <Col span={15}>
                        <Form.Item {...restField} name={[name, 'descParam']} initialValue='num'>
                          <Select options={ceilOpts} />
                        </Form.Item>
                      </Col>
                      {operationTypes[index] === 'num' ? (
                        <>
                          <Col span={15}>
                            <Form.Item {...restField} name={[name, 'paramVal']}>
                              <InputNumber
                                precision={2}
                                min={0}
                                placeholder='请输入'
                                className='w-full'
                              />
                            </Form.Item>
                          </Col>
                          <Col span={9}>
                            <Form.Item
                              {...restField}
                              name={[name, 'specialParam']}
                              initialValue='g'
                            >
                              <Select
                                options={[
                                  { label: 'g', value: 'g' },
                                  {
                                    label: 'kg',
                                    value: 'kg'
                                  },
                                  { label: '克', value: '克' },
                                  { label: '千克', value: '千克' },
                                  { label: '公斤', value: '公斤' },
                                  { label: '个', value: '个' },
                                  { label: '包', value: '包' },
                                  { label: '只', value: '只' },
                                  { label: '对', value: '对' },
                                  { label: '支', value: '支' },
                                  { label: '条', value: '条' },
                                  { label: '袋', value: '袋' }
                                ]}
                              />
                            </Form.Item>
                          </Col>
                        </>
                      ) : (
                        <Col span={24}>
                          <Form.Item {...restField} name={[name, 'paramVal']}>
                            <InputNumber
                              precision={2}
                              min={0}
                              placeholder='请输入'
                              suffix='倍'
                              className='w-full'
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </Row>
                  ))}
                  <Form.Item>
                    <Button block onClick={() => add()}>
                      添加区间
                    </Button>
                  </Form.Item>
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
                  specialParam: 'day'
                }
              ]}
            >
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ name, key, ...restField }, index) => (
                    <Row gutter={12} key={key}>
                      {index !== 0 && (
                        <Col span={24}>
                          <Form.Item {...restField} name={[name, 'checkSign']} initialValue='and'>
                            <Select
                              options={logicOpts}
                              onChange={(val) => val === 'ignore' && remove(index)}
                            />
                          </Form.Item>
                        </Col>
                      )}
                      <Col span={9}>
                        <Form.Item {...restField} name={[name, 'connSign']} initialValue='gt'>
                          <Select options={contrastOpts} />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item {...restField} name={[name, 'paramVal']}>
                          <InputNumber precision={1} min={0} placeholder='请输入' />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item {...restField} name={[name, 'specialParam']} initialValue='day'>
                          <Select options={timeOpts} />
                        </Form.Item>
                      </Col>
                    </Row>
                  ))}
                  <Form.Item>
                    <Button block onClick={() => add()}>
                      添加区间
                    </Button>
                  </Form.Item>
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

const ParentReslut = ({ title, type }: { title: string; type: 'node' | 'pureNode' }) => (
  <>
    <div className='text-sm mb-2'>节点判断</div>
    <div className='p-1.5 bg-blue-100 border ring-1 ring-blue-400 rounded mb-2 break-words'>
      {title}
    </div>
    <div className='text-sm text-gray-600 mb-2'>若上述逻辑条件</div>
    <Form.Item name='sourceResult' noStyle initialValue='T'>
      <Radio.Group disabled={type === 'pureNode'}>
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
