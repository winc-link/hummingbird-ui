import { useState, useEffect, useCallback, SetStateAction } from 'react'

const timeoutError = 'useRequest:timeoutError'
const codeError = 'useRequest:codeError'

export namespace NUseRequest {
  export type request = (params: any) => Promise<any>
  export interface options {
    manual?: boolean; // 默认false, false自动发起请求,true手动调用run方法发起请求
    defaultParams?: {};
    timeout?: number;
    formatData?: (data: any) => any;
    onSuccess?: (data: any) => void;
    throwError?: boolean;
  }

  export interface returns {
    data: any;
    loading: boolean;
    error: Error | any;
    run: (params: any) => Promise<any>;
    reload: () => Promise<any>;
  }
}

export default function useRequest (request: NUseRequest.request, {
  manual = false,
  defaultParams = {},
  timeout = 30000,
  formatData = (data:any):any => data,
  onSuccess,
  throwError = false,
}:NUseRequest.options = {}):NUseRequest.returns {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [params, setParams] = useState(defaultParams)
  useEffect(() => {
    if (manual) return
    run(defaultParams)
  }, [])

  const run = useCallback(async (params: SetStateAction<{}>) => {
    setParams(params)
    setLoading(true)
    try {
      let timer
      const res = await Promise.race([
        request(params),
        // eslint-disable-next-line promise/param-names
        new Promise((res, rej) => {
          timer = setTimeout(() => rej(new Error(timeoutError)), timeout)
        }),
      ])
      clearTimeout(timer)
      console.log(res)
      if (!res.success) throw new Error(codeError)
      setLoading(false)
      const data = formatData(res.result)
      setData(data)
      onSuccess?.(data)
      return data
    } catch (error: any) {
      setLoading(false)
      setError(error)
      if (throwError) throw error
    }
  }, [])

  const reload = useCallback(() => run(params), [run])

  return {
    data,
    loading,
    error,
    run,
    reload,
  }
}

useRequest.timeoutError = timeoutError
useRequest.codeError = codeError
