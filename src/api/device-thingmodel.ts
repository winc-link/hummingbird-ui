import { httpRequest } from '@/utils/request'
import { CommonResponse } from '@/types'

export interface DeviceProperty {
  value: number
  time: number
  code: string
  data_type: string
  unit: string
  name: string
  access_mode: 'RW' | 'R'
}

export function getDeviceProperty (id: string) {
  return httpRequest<any, CommonResponse<DeviceProperty[]>>({
    url: `/api/v1/device/${id}/thing-model/property?last=true`,
  })
}

export interface ReportDaum {
  value: number
  time: number
}

export interface HistoryProperty {
  list: ReportDaum[]
  code: string
  data_type: string
  unit: string
  name: string
  access_mode: string
}

export function getHistoryProperty<T> (id: string, data: {
  code: string
  start: number
  end: number
  page?: number
  pageSize?: number
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/device/${id}/thing-model/history-property?code=${data.code}&range=${data.start}&range=${data.end}&page=${data.page}&pageSize=${data.pageSize}`,
  })
}

export interface DeviceEventRequestType {
  id: string
  eventCode: string
  start: number
  end: number
  // eventType: 'info' | 'alert' | 'error' | ''
  page?: number
  pageSize?: number
}

export interface DeviceEvent {
  event_code: string
  event_type: string
  report_time: number
  name: string
  output_data: {
    Data: string
    Data2: number
  }
}

export function getDeviceEvent<T> ({ id, eventCode, start, end, page, pageSize }: DeviceEventRequestType) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/device/${id}/thing-model/event?eventCode=${eventCode}&range=${start}&range=${end}&page=${page}&pageSize=${pageSize}`,
  })
}

export interface DeviceServiceRequestType {
  id: string
  code: string
  start: number
  end: number
  page?: number
  pageSize?: number
}

export interface DeviceService {
  report_time: number
  code: string
  service_name: string
  input_data: {
    ForceDelete: number
  }
  output_data: {
    code: number
    message: string
  }
}

export function getDeviceService<T> ({ id, code, start, end, page, pageSize }: DeviceServiceRequestType) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/device/${id}/thing-model/service?code=${code}&range=${start}&range=${end}&page=${page}&pageSize=${pageSize}`,
  })
}
