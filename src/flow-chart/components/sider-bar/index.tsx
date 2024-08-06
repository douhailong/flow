import React from 'react';
import { FlowViewNode } from '@ant-design/pro-flow';
import Step1 from './step1';
import Step2 from './step2';
import Step3 from './step3';

export type FinishParams = { step: 1 | 2 | 3; values: { title?: string } };
export type SiderBarProps = {
  selectedNode?: FlowViewNode;
  parentNode?: FlowViewNode;
  onFinish: (params: FinishParams) => void;
};

const SiderBar: React.FC<SiderBarProps> = (props) => {
  return (
    <div className='h-full'>
      {props.selectedNode?.data.metadata.type === 'branch' && (
        <Step1 {...props} />
      )}
      {(props.selectedNode?.data.metadata.type === 'pureNode' ||
        props.selectedNode?.data.metadata.type === 'node') && (
        <Step2 {...props} />
      )}
      {props.selectedNode?.data.metadata.type === 'tip' && <Step3 {...props} />}
    </div>
  );
};

export default SiderBar;
