import React from 'react';
import { useQuery } from 'react-query';
import type { FlowViewNode } from '@ant-design/pro-flow';

import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

import { getCategorys, type DecideTargets } from '@services/index';
import type { NodeType } from '../..//utils';

export type OnFinishProps = { step: 1 | 2 | 3; values?: { title?: string }; title: string };

export type SiderBarProps = {
  selectedNode: FlowViewNode;
  parentNode?: FlowViewNode;
  onFinish: (props: OnFinishProps) => void;
};

const SiderBar: React.FC<SiderBarProps> = (props) => {
  const { data, isLoading, error } = useQuery(['getCategorys'], () =>
    getCategorys('ruleNodeCheckParam')
  );

  const type = props.selectedNode?.data.type as NodeType;

  const decideTargetOptions = data?.data.data
    // @ts-ignore
    .reduce((pre, cur) => (cur.children ? [...pre, ...cur.children] : [...pre, cur]), [])
    // @ts-ignore
    .map((tar) => ({ label: tar.label, value: tar.value }));

  return (
    <div className='h-full'>
      {['branch', 'root'].includes(type) && (
        <Step1 {...props} prefix={type === 'root' ? '规则' : '分支'} />
      )}
      {['pureNode', 'node'].includes(type) && (
        <Step2 {...props} decideTargetOptions={decideTargetOptions} />
      )}
      {type === 'tip' && <Step3 {...props} />}
    </div>
  );
};

export default SiderBar;
