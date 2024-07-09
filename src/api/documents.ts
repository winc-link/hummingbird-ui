import { httpRequest } from '@/utils/request'
import { TableReponseType, CommonResponse } from '@/types'

export function languageSdk<T> () {
  return httpRequest<any, CommonResponse<TableReponseType<T>>>({ url: '/api/v1/language-sdk' })
}
