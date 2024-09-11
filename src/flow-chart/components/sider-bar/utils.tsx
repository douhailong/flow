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
  { label: '取消区间', value: 'ignore' },
  { label: '且', value: 'and' },
  { label: '或', value: 'or' }
];

export const ceilOpts1 = [{ label: '数值', value: 'num' }];

export const ceilOpts2 = [
  { label: '数值', value: 'num' },
  // {
  //   label: '常规剂量每次上限',
  //   value: 'ceil',
  //   disabled: true
  // },
  {
    label: '常规剂量每天上限',
    value: 'dayCeil'
  },
  {
    label: '常规剂量每天下限',
    value: 'minDoseCeil'
  }
];

export type Option = { label: string; value: string };
export type CategoryType = 'default' | 'age' | 'num';
export type RelationType = 'in' | '!in' | 'like' | 'isnull' | 'eq';
