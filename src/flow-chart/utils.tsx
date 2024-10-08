import { SelectType, type FlowViewNode } from '@ant-design/pro-flow';

export const nodeColors = {
  root: '#40a9ff',
  branch: '#95de64',
  node: '#d9f7be',
  pureNode: '#d9f7be',
  tip: '#ffe58f'
} as const;

export const levelColors = {
  green: '#16a34a',
  blue: '#0ea5e9',
  yellow: '#ffe58f',
  red: '#fbcfe8',
  disabled: '#f0f0f0'
} as const;

export const nodeTypeMapping = {
  root: 1,
  branch: 2,
  pureNode: 3,
  node: 3,
  tip: 4
} as const;

export type NodeType = keyof typeof nodeTypeMapping;
export type ModeType = 'readonly' | 'mutable' | 'check';
export type SubmitType = 'sava' | 'audit';

// export const ruleId = sessionStorage.getItem('ruleId')!;
// export const ruleName = sessionStorage.getItem('ruleName')!;
// export const ruleType = sessionStorage.getItem('ruleType')!;
// export const hasDraft = sessionStorage.getItem('hasDraft')!;
// export const version = sessionStorage.getItem('version')!;
// export const auditTime = sessionStorage.getItem('auditTime')!;
// export const nodeId = sessionStorage.getItem('nodeId')!;
// export const mode = sessionStorage.getItem('mode') as ModeType;

export function RootNode(title: string): FlowViewNode[] {
  return [
    {
      id: 'root',
      select: SelectType.SELECT,
      data: {
        title,
        type: 'root'
      },
      style: { background: nodeColors.root }
    }
  ];
}
