import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse } from '@/types'

export function getRuleEngine<T> (params: TableRequestType & {
  status?: string
  name?: string
  end_time?: number
  start_time?: number
  time?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/rule-engine',
    params,
  })
}
export interface DataRuleEngine {
  id: string
  name: string
  description: string
  created: number
  status: string
  resource_type: string
  filter: {
    message_source: string
    select_name: string
    condition: string
    sql: string
  }
  data_resource_id: string
}

export interface AddRuleEngine {
  name: string
  description: string
}

export function addRuleEngine<T> (data: AddRuleEngine) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/rule-engine',
    method: 'post',
    data,
  })
}

export function editRuleEngine<T> (data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/rule-engine',
    method: 'put',
    data,
  })
}

export function getRuleEngineInfo (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/rule-engine/${id}`,
    method: 'get',
  })
}

export function startRuleEngine (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/rule-engine/${id}/start`,
    method: 'post',
  })
}

export function stopRuleEngine (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/rule-engine/${id}/stop`,
    method: 'post',
  })
}

export function statusRuleEngine (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/rule-engine/${id}/status  `,
    method: 'get',
  })
}

export function deleteRuleEngine (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/rule-engine/${id}/delete`,
    method: 'delete',
  })
}

export interface ruleEngine {
  id: string
  name: string
  description: string
  filter: {
    message_source: string
    select_name: string
    condition: string
    sql: string
  }
  data_resource_id: string
}
