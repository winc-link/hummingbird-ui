import { httpRequest } from '@/utils/request'
import { TableReponseType, CommonResponse } from '@/types'

export function categoryTemplate<T> (params: {category_name: string}) {
  return httpRequest<any, CommonResponse<TableReponseType<T>>, {category_name: string}>({
    url: '/api/v1/category-template',
    params,
  })
}
