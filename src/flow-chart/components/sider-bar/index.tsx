import React from 'react';
import Setup1 from './setup1';
import { FlowViewNode } from '@ant-design/pro-flow';
import Setup2 from './setup2';

type SiderBarProps = {
  selectedNode?: FlowViewNode;
  onFinish: (values: any) => void;
};

const SiderBar: React.FC<SiderBarProps> = (props) => {
  return (
    <div className='h-full'>
      {props.selectedNode?.data.metadata.type === 'branch' && <Setup1 {...props} />}
      {(props.selectedNode?.data.metadata.type === 'pureNode' ||
        props.selectedNode?.data.metadata.type === 'node') && <Setup2 {...props} />}
    </div>
  );
};

export default SiderBar;
