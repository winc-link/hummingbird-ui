import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse, TableReponseType } from '@/types'

export interface SupportVersion {
  version: string
  is_default: boolean
  config_file: string
}

export interface DeviceLibraries {
  id: string
  name: string
  description: string
  protocol: string
  version: string
  container_name: string
  docker_config_id: string
  docker_repo_name: string
  operate_status: 'installing' | 'default' | 'installed' | 'uninstall'
  is_internal: boolean
  manual: string
  icon: string
  classify_id: number
  created: number
  language: string
  support_versions: SupportVersion[]
}

export function getDeviceLibraries<T> (params: TableRequestType & {
  is_internal?: boolean
  name?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/device-libraries',
    params,
  })
}

export interface AddDeviceLibraries {
  name: string
  description: string
  container_name: string
  protocol: string
  docker_config_id: string
  docker_repo_name: string
  version: string
}

export function addDeviceLibraries<T> (data: AddDeviceLibraries) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/device-libraries',
    method: 'post',
    data,
  })
}

export function editDeviceLibraries<T> (id: string, data: Pick<AddDeviceLibraries, 'name' | 'description' | 'protocol' | 'docker_config_id'>) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/device-libraries/${id}`,
    method: 'put',
    data,
  })
}

export function deleteDeviceLibraries (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/device-libraries/${id}`,
    method: 'delete',
  })
}

export function getDriverMarket<T> (params?: { name?: string; classify_id: string }) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>>({ url: '/api/v1/device-libraries?isAll=true&is_internal=true', params })
}

export function getDriveClassify<T> () {
  return httpRequest<any, CommonResponse<TableReponseType<T>>>({ url: '/api/v1/driver-classify?isAll=true' })
}
