import { httpRequest } from '@/utils/request'
import { CommonResponse } from '@/types'

export function getNetwork<T> () {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/local/config/network',
    method: 'get',
  })
}

export function getMetrics<T> (params: {
  iface?: string
  metrics_type?: String
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/metrics/system',
    params,
  })
}
