import React from 'react';
import type { FlowViewNode } from '@ant-design/pro-flow';

import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

import type { NodeType } from '../../utils';

export type OnFinishProps = { step: 1 | 2 | 3; values?: any; title: string };

export type SiderBarProps = {
  selectedNode: FlowViewNode;
  parentNode?: FlowViewNode;
  nextNodes?: FlowViewNode[];
  onFinish: (props: OnFinishProps) => void;
};

const SiderBar: React.FC<SiderBarProps> = (props) => {
  const type = props.selectedNode?.data.type as NodeType;

  return (
    <div className='h-full'>
      {!type && <div className='text-center text-gray-400'>请选择节点</div>}
      {['branch', 'root'].includes(type) && (
        <Step1 {...props} prefix={type === 'root' ? '规则' : '分支'} />
      )}
      {['pureNode', 'node'].includes(type) && <Step2 {...props} />}
      {type === 'tip' && <Step3 {...props} />}
    </div>
  );
};

export default SiderBar;
