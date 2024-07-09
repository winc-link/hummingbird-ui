import { http, httpRequest } from '@/utils/request'
import { CommonResponse, TableReponseType, TableRequestType } from '@/types'

export interface DevicesType {
  id: string
  name: string
  product_id: string
  status: string
  platform: string
  cloud_instance_id: string
  cloud_product_id: string
  driver_service_name: string
  product_name: string
  last_sync_time: number
  last_online_time: number
  drive_instance_id: string
  created: number
}

export function getDevice (params: TableRequestType & {
  product_id?: string
  name?: string
}) {
  return httpRequest<any, CommonResponse<TableReponseType<DevicesType>>>({
    url: '/api/v1/devices',
    params,
  })
}

export function addDevices (data: FormData, options: {
  product_id: string
  driver_instance_id?: string
}) {
  const { product_id, driver_instance_id } = options
  const querys = []
  product_id && querys.push(`product_id=${product_id}`)
  driver_instance_id && querys.push(`driver_instance_id=${driver_instance_id}`)
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/devices/import?${querys.join('&')}`,
    method: 'post',
    data,
  })
}

export function deleteDevices (data: { device_ids: string[] }) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/devices',
    method: 'delete',
    data,
  })
}

export function bindDriver (data: {
  device_ids: string[]
  driver_instance_id: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/devices/bind-driver',
    method: 'put',
    data,
  })
}

export function unBindDriver (data: { device_ids: string[] }) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/devices/unbind-driver',
    method: 'put',
    data,
  })
}

export function downloadTemplate () {
  return http({
    url: '/api/v1/devices/import-template',
    responseType: 'blob',
  })
}

// 发布产品
export function productRelease<T> (productId : string) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/product-release/${productId}`,
    method: 'post',
  })
}

// 取消产品发布
export function productUnrelease<T> (productId : string) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/product-unrelease/${productId}`,
    method: 'post',
  })
}
