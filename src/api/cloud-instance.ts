import { httpRequest } from '@/utils/request'
import { TableReponseType, CommonResponse } from '@/types'

export interface CloudInstance {
  authorization_config: any
  created: number
  extend_template: string
  id: string
  is_internal: boolean
  log_filter: any
  log_switch: boolean
  name: string
  run_status: number
}

export function cloudInstance () {
  return httpRequest<any, CommonResponse<TableReponseType<CloudInstance>>>({
    url: '/api/v1/cloud-instance',
  })
}

export function cloudInstanceAuthorization<T> (id: string, data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/cloud-instance/${id}/authorization`,
    method: 'post',
    data,
  })
}
