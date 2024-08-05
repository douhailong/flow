import React from 'react';
import { Form, Input, Select, DatePicker, Row, Col, Button, Table } from 'antd';
import { ColumnsType } from 'antd/lib/table';
import ConfirmFormModal from '@components/confirm-form-modal';

type IndexProps = {};

const columns: ColumnsType<{}> = [
  {
    title: '审核日期',
    dataIndex: 'date'
  },
  {
    title: '规则名称',
    dataIndex: 'ruleName'
  },
  {
    title: '分支数量',
    dataIndex: 'branchNum'
  },
  {
    title: '规则数量',
    dataIndex: 'ruleNum'
  },
  {
    title: '节点数量',
    dataIndex: 'nodeNum'
  },
  {
    title: '版本',
    dataIndex: 'version'
  },
  {
    title: '操作',
    render: (row) => (
      <div>
        <Button size='small' type='link'>
          查看
        </Button>
        <Button size='small' type='link' danger>
          草稿
        </Button>
        <Button size='small' type='link'>
          编辑
        </Button>
      </div>
    )
  },
  {
    title: '历史版本',
    render: (row) => (
      <Button size='small' type='link'>
        查看
      </Button>
    )
  }
];

const dataSource = [
  {
    key: '1',
    date: '2022-01-01',
    ruleName: '规则名称',
    branchNum: 1,
    ruleNum: 1,
    nodeNum: 1,
    version: '1.0.0'
  }
];

const Index: React.FC<IndexProps> = ({}) => {
  return (
    <div className='h-full bg-gray-50'>
      <div className='p-3 rounded-sm bg-white'>
        <Form>
          <Row gutter={24}>
            <Col span={6}>
              <Form.Item label='起始日期'>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='结束日期'>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='规则名称'>
                <Input />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label='规则草稿'>
                <Select />
              </Form.Item>
            </Col>
          </Row>
        </Form>
        <div className='flex space-x-3 justify-end'>
          <Button type='primary' onClick={() => ConfirmFormModal({ title: '新增规则' })}>
            新增
          </Button>
          <Button type='primary'>查询</Button>
          <Button type='primary'>重置</Button>
        </div>
      </div>
      <div className='p-3 mt-4 bg-white rounded-sm'>
        <Table columns={columns} dataSource={dataSource} />
      </div>
    </div>
  );
};

export default Index;
