import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse } from '@/types'

export function getAlarmList<T> (params: TableRequestType & {
  alert_level?: String
  status?: string
  name?: string
  trigger_end_time?: number
  trigger_start_time?: number
  trigger_time?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/alert-list',
    params,
  })
}

export interface AlertList {
  id: string
  name: string
  alert_result: String
  alert_level: String
  trigger_time: Number
  treated_time: Number
  message: string
  status: string
}

export function getAlertPlate<T> () {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/alert-plate',
    method: 'get',
  })
}

export function alertIgnore (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/alert-ignore/${id}`,
    method: 'put',
  })
}

export function alertTreated<T> (data: {id: String, message: String}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/alert-treated',
    method: 'post',
    data,
  })
}
