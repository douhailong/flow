export const relationOpts1 = [
  { value: 'in', label: '属于' },
  { value: '!in', label: '不属于' },
  { value: 'like', label: '匹配' },
  { value: 'isnull', label: '为空' }
];

export const relationOpts2 = [...relationOpts1, { value: 'eq', label: '等于' }];

export const contrastOpts = [
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'ge' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'le' },
  { label: '等于', value: 'eq' }
];

export const timeOpts = [
  { label: '天', value: 'day' },
  { label: '月', value: 'month' },
  { label: '岁', value: 'year' }
];

export const logicOpts = [
  { label: '添加区间', value: 'ignore' },
  { label: '且', value: 'and' },
  { label: '或', value: 'or' }
];

export type Option = { label: string; value: string };
export type CategoryType = 'default' | 'age' | 'num';
export type RelationType = 'in' | '!in' | 'like' | 'isnull' | 'eq';
