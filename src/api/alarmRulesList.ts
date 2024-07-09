import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse } from '@/types'

export function getAlertRule<T> (params: TableRequestType & {
  name?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/alert-rule',
    params,
  })
}

export interface AlertRule {
  id: string
  name: string
  description: string
  alert_type: string
  status: 'running' | 'stopped'
  created: number
}

export interface AddRule {
  name: string
  alert_level: string
  description: string
}

export function addRule<T> (data: AddRule) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/alert-rule',
    method: 'post',
    data,
  })
}

export function deleteRule (ruleId: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/alert-rule/${ruleId}`,
    method: 'delete',
  })
}

export function startRule <T> (ruleId: string) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/alert-rule/${ruleId}/start`,
    method: 'post',
  })
}

export function stopRule <T> (ruleId: string) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/alert-rule/${ruleId}/stop `,
    method: 'post',
  })
}

export function getRuleInfo<T> (ruleId: string) {
  return httpRequest<any, CommonResponse<T>, { ruleId: string }>({
    url: `/api/v1/alert-rule/${ruleId}`,
    method: 'get',
    params: {
      ruleId,
    },
  })
}
export interface Sub_rule {
  trigger: string,
  product_id: string,
  device_id: string,
  option: object
}

export interface RuleLibraries {
  id: string
  // sub_rule: Sub_rule[]
}

export function editAlarmRules<T> (id : string, data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/alert-rule/${id}`,
    method: 'put',
    data,
  })
}

export function editRules<T> (id : string, data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/rule-field',
    method: 'put',
    data,
  })
}
