import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import { Flex, Table, Transfer } from 'antd';
import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd';
import type { Option } from './utils';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  key: string;
  title: string;
  description: string;
  label: string;
}

interface TableTransferProps extends TransferProps<TransferItem> {
  dataSource: DataType[];
  leftColumns: TableColumnsType<DataType>;
  rightColumns: TableColumnsType<DataType>;
}

// Customize Table Transfer
const TableTransfer: React.FC<TableTransferProps> = (props) => {
  const { leftColumns, rightColumns, ...restProps } = props;
  return (
    <Transfer titles={['未选择药品', '已选择药品']} style={{ width: '100%' }} {...restProps}>
      {({
        direction,
        filteredItems,
        onItemSelectAll,
        selectedKeys: listSelectedKeys,
        disabled: listDisabled
      }) => {
        const columns = direction === 'left' ? leftColumns : rightColumns;
        const rowSelection: TableRowSelection<TransferItem> = {
          getCheckboxProps: () => ({ disabled: listDisabled }),
          onChange(selectedRowKeys) {
            onItemSelectAll(selectedRowKeys, 'replace');
          },
          selectedRowKeys: listSelectedKeys,
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE]
        };

        return (
          <Table
            rowKey={(row) => row.key}
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredItems}
            size='small'
            style={{ pointerEvents: listDisabled ? 'none' : undefined }}
          />
        );
      }}
    </Transfer>
  );
};

const columns: TableColumnsType<DataType> = [
  {
    dataIndex: 'label',
    title: '药品名称',
    key: 'value'
  },
  {
    dataIndex: 'title',
    title: '药品编号',
    key: 'value'
  }
];

const filterOption = (input: string, item: DataType) =>
  item.title?.includes(input) || item.label?.includes(input);

export type TransferData = Option & { children: TransferData[] };

type TransferTableProps = {
  dataSource: TransferData[];
  keys: TransferProps['targetKeys'];
};

const TransferTable = forwardRef(({ dataSource, keys }: TransferTableProps, ref) => {
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  useEffect(() => setTargetKeys(keys), [keys]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  useImperativeHandle(ref, () => ({
    onOk: () => targetKeys,
    onCancel: () => setTargetKeys(keys),
    onClear: () => setTargetKeys([])
  }));

  return (
    <Flex align='start' gap='middle' vertical>
      <TableTransfer
        dataSource={dataSource as any as DataType[]}
        targetKeys={targetKeys}
        showSearch
        showSelectAll={false}
        onChange={onChange}
        filterOption={filterOption}
        leftColumns={columns}
        rightColumns={columns}
      />
    </Flex>
  );
});

export default TransferTable;
