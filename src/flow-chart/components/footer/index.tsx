import React from 'react';
import { ruleVersion, auditTime, ruleName } from '../../utils';

type FooterProps = {
  branchNum: number;
  ruleNum: number;
  nodeNum: number;
};

const Footer: React.FC<FooterProps> = ({ branchNum, ruleNum, nodeNum }) => {
  return (
    <div className='h-10 bg-gray-200 flex justify-between items-center px-8 text-xs text-gray-600'>
      <div className='flex space-x-3'>
        <span>
          {ruleName} {ruleVersion}
        </span>
        <span>创建时间：{auditTime}</span>
      </div>
      <div className='flex space-x-3'>
        <span>分支数量：{branchNum}条</span>
        <span>|</span>
        <span>规则数量：{ruleNum}条</span>
        <span>|</span>
        <span>节点数量：{nodeNum}个</span>
      </div>
    </div>
  );
};

export default Footer;
