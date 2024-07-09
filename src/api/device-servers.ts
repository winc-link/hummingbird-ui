import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse, TableReponseType } from '@/types'

export interface SupportVersion {
  version: string
  is_default: boolean
  config_file: string
}

export interface Config { }

export interface DeviceLibrary {
  id: string
  name: string
  description: string
  protocol: string
  version: string
  container_name: string
  docker_config_id: string
  docker_repo_name: string
  operate_status: string
  is_internal: boolean
  manual: string
  icon: string
  classify_id: number
  created: number
  language: string
  support_versions: SupportVersion[]
}

export interface DeviceServers {
  id: string
  name: string
  deviceLibrary: DeviceLibrary
  runStatus: number
  config: Config
  expertMode: boolean
  expertModeContent: string
  dockerParamsSwitch: boolean
  dockerParams: string
  create_at: number
  imageExist: boolean
  platform: string
}

export function getDeviceServers (params: TableRequestType) {
  return httpRequest<any, CommonResponse<TableReponseType<DeviceServers>>>({
    url: '/api/v1/device-servers',
    params,
  })
}

export interface EditDeviceServers {
  id: string
  docker_params_switch: boolean
  docker_params: string
  expertMode: boolean
  expertModeContent: string
}

export function editDeviceServers<T> (data: EditDeviceServers) {
  return httpRequest<any, CommonResponse<T>>({
    url: `/api/v1/device-server/${data.id}`,
    method: 'put',
    data,
  })
}
