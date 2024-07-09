import { httpRequest } from '@/utils/request'
import { TableReponseType, CommonResponse } from '@/types'
import { ThingModelType } from '@/pages/gateway/ProductManage/types'

export function addThingModel (data: any) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/thingmodel',
    method: 'post',
    data,
  })
}

export function deleteThingModel (data: {
  thing_model_id: string
  thing_model_type: string
}) {
  return httpRequest<any, CommonResponse<any>>({
    url: '/api/v1/thingmodel',
    method: 'delete',
    data,
  })
}

export function thingModelSystem<T> (params: {
  modelName: string
  thingModelType?: ThingModelType
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/thingmodel/system',
    params,
  })
}

export function thingModelUnit<T> (params: { isAll: boolean }) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>>({
    url: '/api/v1/thingmodel/unit',
    params,
  })
}
