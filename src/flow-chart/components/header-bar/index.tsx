import React from 'react';
import { Input } from 'antd';
import { type FlowViewEdge, type FlowViewNode, useFlowEditor } from '@ant-design/pro-flow';
import type { TypeNode } from '../../flow-chart';
import Copy from '@assets/copy.png';
import Branch from '@assets/branch.png';
import Audit from '@assets/audit.png';
import Delete from '@assets/delete.png';
import Save from '@assets/save.png';
import Paste from '@assets/paste.png';
import Redo from '@assets/redo.png';
import Undo from '@assets/undo.png';
import Share from '@assets/share.png';
import Tip from '@assets/tip.png';
import clsx from 'clsx';

type HeaderBarProps = {
  selectedNode?: FlowViewNode;
  onAddBranch: (type: TypeNode) => void;
  onDelete: () => void;
  onCopy: () => void;
  onSearch: (value: string) => void;
  onConfirm: (type: 'sava' | 'audit') => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedNode,
  onAddBranch,
  onDelete,
  onSearch,
  onCopy,
  onConfirm
}) => {
  const { undo, redo } = useFlowEditor();

  const isTipDisaled = () =>
    selectedNode?.data.metadata.type !== 'node' && selectedNode?.data.metadata.type !== 'pureNode';

  const isNodeDisaled = () =>
    selectedNode?.data.metadata.type !== 'branch' &&
    selectedNode?.data.metadata.type !== 'node' &&
    selectedNode?.data.metadata.type !== 'pureNode';

  return (
    <div className='h-14 bg-gray-200 flex justify-between items-center px-8'>
      <div className='flex space-x-4'>
        <button className='text-xs flex flex-col items-center' onClick={() => onConfirm('sava')}>
          <img width={24} height={24} src={Save} />
          <span>保存</span>
        </button>
        <button className='text-xs flex flex-col items-center' onClick={() => onConfirm('audit')}>
          <img width={24} height={24} src={Audit} />
          <span>审核</span>
        </button>
      </div>
      <div className='flex space-x-4'>
        <button
          className='text-xs flex flex-col items-center'
          disabled={selectedNode?.id !== 'root'}
          onClick={() => onAddBranch('branch')}
        >
          <img
            width={24}
            height={24}
            src={Branch}
            className={clsx(selectedNode?.id !== 'root' && 'opacity-30')}
          />
          <span>分支</span>
        </button>
        <button
          className='text-xs flex flex-col items-center'
          disabled={isNodeDisaled()}
          onClick={() =>
            onAddBranch(selectedNode?.data.metadata.type === 'branch' ? 'pureNode' : 'node')
          }
        >
          <img
            width={24}
            height={24}
            src={Share}
            className={clsx(isNodeDisaled() && 'opacity-30')}
          />
          <span>节点</span>
        </button>
        <button
          className='text-xs flex flex-col items-center'
          disabled={isTipDisaled()}
          onClick={() => onAddBranch('tip')}
        >
          <img width={24} height={24} src={Tip} className={clsx(isTipDisaled() && 'opacity-30')} />
          <span>警示</span>
        </button>
        <div className='w-16'></div>
        <button className='text-xs flex flex-col items-center' onClick={onCopy}>
          <img width={24} height={24} src={Copy} />
          <span>复制</span>
        </button>
        <button className='text-xs flex flex-col items-center'>
          <img width={24} height={24} src={Paste} />
          <span>粘贴</span>
        </button>
        <button className='text-xs flex flex-col items-center' onClick={() => undo()}>
          <img width={24} height={24} src={Undo} />
          <span>撤销</span>
        </button>
        <button className='text-xs flex flex-col items-center' onClick={() => redo()}>
          <img width={24} height={24} src={Redo} />
          <span>恢复</span>
        </button>
        <button
          className='text-xs flex flex-col items-center'
          disabled={selectedNode?.id === 'root' || !selectedNode?.id}
          onClick={onDelete}
        >
          <img width={24} height={24} src={Delete} />
          <span>删除</span>
        </button>
      </div>
      <Input
        className='w-64'
        placeholder='请输入搜索内容'
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
};

export default HeaderBar;
