import { httpRequest, http } from '@/utils/request'
import { CommonResponse } from '@/types'

export function getDeviceStatusTemplate () {
  return httpRequest<any, CommonResponse<string[]>>({
    url: '/api/v1/device/status-template',
  })
}

export interface IDeviceDetail {
  id: string
  cloud_device_id: string
  cloud_product_id: string
  cloud_instance_id: string
  name: string
  status: string
  description: string
  product_id: string
  product_name: string
  secret: string
  platform: string
  device_service_name: string
  last_sync_time: number
  last_online_time: number
  create_at: number
}

export function getDeviceDetail (id: string) {
  return httpRequest<any, CommonResponse<IDeviceDetail>>({
    url: `/api/v1/device/${id}`,
  })
}

export function addDevice (data: {
  name: string
  product_id: string
  driver_instance_id: string
  description?: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/device',
    method: 'post',
    data,
  })
}

export function editDevices (data: {
  id: string
  description: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/device/${data.id}`,
    method: 'put',
    data,
  })
}

export function deleteDevice (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/device/${id}`,
    method: 'delete',
  })
}

export function deviceSync (data: {
  cloud_instance_id: string
  driver_instance_id: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/device-sync',
    method: 'post',
    data,
  })
}

export function deviceSyncSingle (data: {
  device_id: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/device-sync/${data.device_id}`,
    method: 'post',
    data,
  })
}

export function uploadValidated (data: FormData) {
  return http({
    url: '/api/v1/device/upload-validated',
    method: 'post',
    data,
  })
}
