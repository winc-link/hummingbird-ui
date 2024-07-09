import { httpRequest } from '@/utils/request'
import { CommonResponse } from '@/types'

export function getHomePageInfo<T> () {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/home-page',
    method: 'get',
  })
}
