import { httpRequest } from '@/utils/request'
import { TableRequestType, TableReponseType, CommonResponse } from '@/types'

export function getDockerConfigs<T> (params: TableRequestType) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, TableRequestType>({
    url: '/api/v1/docker-configs',
    params,
  })
}

export interface AddDockerConfigs {
  account?: string
  password?: string
  address: string
}

export function addDockerConfigs (data: AddDockerConfigs) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/docker-configs',
    method: 'post',
    data,
  })
}

export function editDockerConfigs (id: string, data: AddDockerConfigs & { id: string }) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/docker-configs/${id}`,
    method: 'put',
    data,
  })
}

export function deleteDockerConfigs (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/docker-configs/${id}`,
    method: 'delete',
  })
}
