import axios, { AxiosRequestConfig, AxiosResponse } from 'axios'
import { getToken } from './auth'
// import { redirect } from 'react-router-dom'
// import { xToken } from './config'
import { createBrowserHistory } from 'history'
import { message } from 'antd'

const history = createBrowserHistory()

export const http = axios.create({
  timeout: 30 * 1000,
})

http.interceptors.request.use(
  (config) => {
    config.headers = {
      ...config.headers,
      'x-token': getToken(),
      // Authorization: `Bearer ${getToken()}`,

    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

http.interceptors.response.use(
  (response) => {
    // console.log('response', response)
    if (response.data.errorCode === 10006) {
      message.error(response?.data.errorMsg)
      history.replace('/auth/login')
    }
    return response
  },
  (error) => {
    return Promise.reject(error)
  },
)

export function httpRequest <T = any, R = AxiosResponse<T>, D = any> (config: AxiosRequestConfig<D>): Promise<R> {
  return http<T, R, D>(config).then((resp: any) => {
    if (resp.statusText === 'OK' && resp.status === 200) {
      return resp.data
    }

    return resp
  })
}
