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

export function getDecideTargets(
  code:
    | 'ruleNodeCheckParam'
    | 'specialBoilType'
    | 'takeType'
    | 'belong'
    | 'pathogen'
    | 'toxicPieces'
) {
  return request<DecideTargets>({
    method: 'post',
    url: `/recipehub/recipeRule/getLookUpTreeByCode?code=${code}`
  });
}

export type SaveRuleDraftProps = {
  ruleId: string;
  ruleName: string;
  ruleBranchNum: number;
  ruleNum: number;
  ruleNodeNum: number;
  ruleData: any[];
};
export function saveRuleDraft(data: SaveRuleDraftProps) {
  return request<any>({
    method: 'post',
    url: '/recipehub/recipeRuleDraft/saveRuleDraft',
    data
  });
}

export function auditRuleDraft(data: SaveRuleDraftProps) {
  return request<any>({
    method: 'post',
    url: '/recipehub/recipeRuleDraft/saveRuleDraft',
    data
  });
}
