import request from './request';

export function aaa() {
  return request<any>({
    method: 'post',
    url: `/recipehub/recipeRule/getLookUpListByCode?code=ruleNodeCheckParam
`
  });
}
