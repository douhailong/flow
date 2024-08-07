import request from './request';

export type DecideTargets = {
  data: {
    code: string;
    value: string;
    label: string;
    seq: number;
    desc: string;
    children?: DecideTargets[];
  }[];
};

export function getDecideTargets() {
  return request<DecideTargets>({
    method: 'post',
    url: `/recipehub/recipeRule/getLookUpTreeByCode?code=ruleNodeCheckParam`
  });
}
