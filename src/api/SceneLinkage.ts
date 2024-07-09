import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse } from '@/types'

export function getScene<T> (params: TableRequestType & {
  name?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/scene',
    params,
  })
}

export interface Conditions {
  condition_type: string
  option: {
    code: string
    decide_condition: string
    device_id: string
    device_name: string
    product_id: string
    product_name: string
    trigger: string
    value_cycle: string
    value_type: string
    type: string
  }
}
export interface Actions {
  code: string
  data_type: string
  device_id: string
  device_name: string
  product_id: string
  product_name: string
  value: string
}
export interface Scene {
  id: string
  name: string
  description: string
  status: 'running' | 'stopped'
  created: number
  conditions: Conditions[],
  actions: Actions[]
}

export interface AddScene {
  name: string
  description: string
}

export function addScene<T> (data: AddScene) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/scene',
    method: 'post',
    data,
  })
}
export interface SceneData {
  id: string,
  conditions: Conditions[],
  actions: Actions[]
}

export function editScene<T> (data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/scene',
    method: 'put',
    data,
  })
}

export function startScene (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/scene/${id}/start`,
    method: 'post',
  })
}

export function stopScene (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/scene/${id}/stop`,
    method: 'post',
  })
}

export function deleteScene (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/scene/${id}`,
    method: 'delete',
  })
}

export function logScene<T> (params: TableRequestType, id: string & {
  time?: string
  start_time?: string
  end_time?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/scene/${id}/log`,
    params,
  })
}
