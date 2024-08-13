import React, { useState } from 'react';
import { Flex, Table, Transfer } from 'antd';
import type { GetProp, TableColumnsType, TableProps, TransferProps } from 'antd';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];
type TableRowSelection<T extends object> = TableProps<T>['rowSelection'];

interface DataType {
  key: string;
  title: string;
  description: string;
  tag: string;
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

const mockTags = ['cat', 'dog', 'bird'];

const mockData = Array.from({ length: 20 }).map<DataType>((_, i) => ({
  key: i.toString(),
  title: `content${i + 1}`,
  description: `description of content${i + 1}`,
  tag: mockTags[i % 3]
}));

const columns: TableColumnsType<DataType> = [
  {
    dataIndex: 'title',
    title: 'Name'
  },
  {
    dataIndex: 'description',
    title: 'Description'
  }
];

const filterOption = (input: string, item: DataType) =>
  item.title?.includes(input) || item.tag?.includes(input);

const App: React.FC = () => {
  const [targetKeys, setTargetKeys] = useState<TransferProps['targetKeys']>([]);

  const onChange: TableTransferProps['onChange'] = (nextTargetKeys) => {
    setTargetKeys(nextTargetKeys);
  };

  return (
    <Flex align='start' gap='middle' vertical>
      <TableTransfer
        dataSource={mockData}
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
};

export default App;
