import request from './request';

export type GetCategory = {
  code: string;
  value: string;
  label: string;
  seq: number;
  desc: string;
  children?: GetCategory[];
};

export type GetCategorys = {
  data: GetCategory[];
};

export function getCategorys(
  code:
    | 'ruleNodeCheckParam'
    | 'specialBoilType'
    | 'takeType'
    | 'belong'
    | 'pathogen'
    | 'toxicPieces'
    | 'recipeWarnType'
) {
  return request<GetCategorys>({
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
    url: '/recipehub/recipeRuleDraft/auditRuleDraft',
    data
  });
}

export type GetTreeDataProps = {
  ruleId: string;
  ruleType: string;
  ruleVersion?: string;
};

export function getRuleData(data: GetTreeDataProps) {
  return request<any>({
    method: 'post',
    url: '/recipehub/recipeRule/getRuleJsonData',
    data
  });
}

type GetDrugs = {
  data: {
    id: string;
    medicineName: string;
    medicineCode: string;
  }[];
};

export function getDrugs() {
  return request<GetDrugs>({
    method: 'post',
    url: '/recipehub/medicine/listMedicine',
    data: { useState: 0 }
  });
}

export function judgeHasDraft(ruleId: string) {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRule/auditOrAddDraft?ruleId=${ruleId}`
  });
}

export function judgeHasPermission(ruleId: string) {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRuleDraft/auditDraftCheck?ruleId=${ruleId}`
  });
}

export function isCanOperation(ruleId: string) {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRuleDraft/saveDraftCheck?ruleId=${ruleId}`
  });
}

export function getInUseWarnLevels() {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRule/getInUseWarnLevels`
  });
}

export function renewal(ruleId: string) {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRuleDraft/updateExpireTime?ruleId=${ruleId}`
  });
}
