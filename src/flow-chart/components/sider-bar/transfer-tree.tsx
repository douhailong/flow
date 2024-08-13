import React, {
  useState,
  ForwardRefRenderFunction,
  forwardRef,
  useImperativeHandle,
  useEffect
} from 'react';
import { theme, Transfer, Tree } from 'antd';
import type { GetProp, TransferProps, TreeDataNode } from 'antd';
import type { Option } from './utils';

type TransferItem = GetProp<TransferProps, 'dataSource'>[number];

interface TreeTransferProps {
  dataSource: TreeDataNode[];
  targetKeys: TransferProps['targetKeys'];
  onChange: TransferProps['onChange'];
}

// Customize Table Transfer
const isChecked = (selectedKeys: React.Key[], eventKey: React.Key) =>
  selectedKeys.includes(eventKey);

const generateTree = (
  treeNodes: TreeDataNode[] = [],
  checkedKeys: TreeTransferProps['targetKeys'] = []
): TreeDataNode[] =>
  treeNodes.map(({ children, ...props }) => ({
    ...props,
    disabled: checkedKeys.includes(props.key as string),
    children: generateTree(children, checkedKeys)
  }));

const TreeTransfer: React.FC<TreeTransferProps> = ({
  dataSource,
  targetKeys = [],
  ...restProps
}) => {
  const { token } = theme.useToken();

  const transferDataSource: TransferItem[] = [];
  function flatten(list: TreeDataNode[] = []) {
    list.forEach((item) => {
      transferDataSource.push(item as TransferItem);
      flatten(item.children);
    });
  }
  flatten(dataSource);

  return (
    <Transfer
      {...restProps}
      titles={['未选择诊断项', '已选择诊断项']}
      targetKeys={targetKeys}
      dataSource={transferDataSource}
      render={(item) => item.title!}
    >
      {({ direction, onItemSelect, selectedKeys }) => {
        if (direction === 'left') {
          const checkedKeys = [...selectedKeys, ...targetKeys];
          return (
            <div style={{ padding: token.paddingXS }}>
              <Tree
                blockNode
                checkable
                checkStrictly
                defaultExpandAll
                checkedKeys={checkedKeys}
                treeData={generateTree(dataSource, targetKeys)}
                onCheck={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key));
                }}
                onSelect={(_, { node: { key } }) => {
                  onItemSelect(key as string, !isChecked(checkedKeys, key));
                }}
              />
            </div>
          );
        }
      }}
    </Transfer>
  );
};

export type TransferData = Option & { children: TransferData[] };

type TransferTreeProps = {
  dataSource: TransferData[];
  // onKeyChange: (vals: React.Key[]) => void;
  keys: TreeTransferProps['targetKeys'];
};

const TransferTree = forwardRef(({ dataSource, keys }: TransferTreeProps, ref) => {
  const [targetKeys, setTargetKeys] = useState<TreeTransferProps['targetKeys']>([]);

  useEffect(() => setTargetKeys(keys), [keys]);

  useImperativeHandle(ref, () => ({
    onOk: () => targetKeys,
    onCancel: () => setTargetKeys(keys),
    onClear: () => setTargetKeys([])
  }));

  const onChange: TreeTransferProps['onChange'] = (keys) => {
    setTargetKeys(keys);
  };

  function transferData(data: TransferData[]): TreeDataNode[] {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const { value, label, children } = data[i];
      if (children) {
        result.push({ key: value, title: label, children: transferData(children) });
      } else {
        result.push({ key: value, title: label });
      }
    }
    return result;
  }

  return (
    <TreeTransfer
      dataSource={transferData(dataSource)}
      targetKeys={targetKeys}
      onChange={onChange}
    />
  );
});

export default TransferTree;
