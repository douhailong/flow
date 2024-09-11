import { Button, Input, message, Space } from 'antd';
import clsx from 'clsx';
import { Info, Trash2, CopyPlus, ClipboardPaste } from 'lucide-react';
import { type FlowViewNode } from '@ant-design/pro-flow';
import type { NodeType } from '../../utils';
import { debounce } from 'lodash-es';

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
import Running from '@assets/running.png';
import Edit from '@assets/edit.png';
import { useState } from 'react';

type HeaderBarProps = {
  selectedNode?: FlowViewNode;
  mode: string;
  nodes: FlowViewNode[];
  onAddBranch: (type: NodeType) => void;
  onDelete: () => void;
  onCopy: () => void;
  onPaste: () => void;
  onSwitchToMutable: () => void;
  onLookRunningRule: (val?: string) => void;
  onSearch: (resultId: string, clear?: boolean) => void;
  onSubmit: (type: 'sava' | 'audit') => void;
};

const HeaderBar: React.FC<HeaderBarProps> = ({
  selectedNode,
  onAddBranch,
  onLookRunningRule,
  onSwitchToMutable,
  onDelete,
  onSearch,
  onCopy,
  onPaste,
  onSubmit,
  nodes,
  mode
}) => {
  const [curIndex, setCurIndex] = useState(0);
  const [matchNds, setMatchNds] = useState<FlowViewNode[]>([]);
  const type = selectedNode?.data.type;

  const isTipDisaled = !['pureNode', 'node'].includes(type);
  const isNodeDisaled = !['branch', 'node', 'pureNode'].includes(type);

  return (
    <div className='h-14 bg-gray-200 flex justify-between items-center px-8'>
      {mode === 'mutable' ? (
        <>
          <div className='flex space-x-4'>
            <button className='text-xs flex flex-col items-center' onClick={() => onSubmit('sava')}>
              <img width={24} height={24} src={Save} />
              <span>保存</span>
            </button>
            <button
              className='text-xs flex flex-col items-center'
              onClick={() => onSubmit('audit')}
            >
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
              disabled={isNodeDisaled}
              onClick={() => onAddBranch(type === 'branch' ? 'pureNode' : 'node')}
            >
              <img
                width={24}
                height={24}
                src={Share}
                className={clsx(isNodeDisaled && 'opacity-30')}
              />
              <span>节点</span>
            </button>
            <button
              className='text-xs flex flex-col items-center'
              disabled={isTipDisaled}
              onClick={() => onAddBranch('tip')}
            >
              <img
                width={24}
                height={24}
                src={Tip}
                className={clsx(isTipDisaled && 'opacity-30')}
              />
              <span>警示</span>
            </button>
            <div className='w-16'></div>
            <button
              disabled={selectedNode?.id === 'root'}
              className='text-xs flex flex-col items-center'
              onClick={onCopy}
            >
              <img
                width={24}
                height={24}
                src={Copy}
                className={clsx(selectedNode?.id === 'root' && 'opacity-30')}
              />
              <span>复制</span>
            </button>
            <button
              className='text-xs flex flex-col items-center'
              onClick={() => onPaste()}
              disabled={type === 'tip'}
            >
              <img
                width={24}
                height={24}
                src={Paste}
                className={clsx(type === 'tip' && 'opacity-30')}
              />
              <span>粘贴</span>
            </button>
            {/* <button
              className='text-xs flex flex-col items-center'
              onClick={() => message.info('暂未开放')}
            >
              <img width={24} height={24} src={Undo} />
              <span>撤销</span>
            </button>
            <button
              className='text-xs flex flex-col items-center'
              onClick={() => message.info('暂未开放')}
            >
              <img width={24} height={24} src={Redo} />
              <span>恢复</span>
            </button> */}
            <button
              className='text-xs flex flex-col items-center'
              disabled={selectedNode?.id === 'root' || !selectedNode?.id}
              onClick={onDelete}
            >
              <img
                width={24}
                height={24}
                src={Delete}
                className={clsx((selectedNode?.id === 'root' || !selectedNode?.id) && 'opacity-30')}
              />
              <span>删除</span>
            </button>
          </div>
        </>
      ) : mode === 'check' ? (
        <div className='flex space-x-4'>
          <button className='text-xs flex flex-col items-center' onClick={onSwitchToMutable}>
            <img width={24} height={24} src={Edit} />
            <span>编辑规则</span>
          </button>
          <button
            className='text-xs flex flex-col items-center'
            onClick={() => onLookRunningRule()}
          >
            <img width={24} height={24} src={Running} />
            <span>运行中规则</span>
          </button>
        </div>
      ) : (
        <div></div>
      )}
      <Input
        className='w-80'
        placeholder='请输入搜索内容'
        onChange={debounce((e: any) => {
          const value = e.target.value.trim();
          if (!value) {
            setMatchNds([]);
            setCurIndex(0);
            onSearch('', true);
            return;
          }
          const matNds = nodes.filter((node) => node.data.title.includes(value));
          setMatchNds(matNds);
          setCurIndex(0);
          onSearch(matNds[0]?.id);
        }, 300)}
        suffix={
          <Space>
            <Button
              size='small'
              disabled={curIndex === 0}
              onClick={() => {
                setCurIndex(curIndex - 1);
                onSearch(matchNds[curIndex - 1]?.id);
              }}
            >
              上一个
            </Button>
            <Button
              size='small'
              disabled={curIndex === matchNds.length - 1 || !matchNds.length}
              onClick={() => {
                setCurIndex(curIndex + 1);
                onSearch(matchNds[curIndex + 1]?.id);
              }}
            >
              下一个
            </Button>
          </Space>
        }
      />
    </div>
  );
};

export default HeaderBar;
