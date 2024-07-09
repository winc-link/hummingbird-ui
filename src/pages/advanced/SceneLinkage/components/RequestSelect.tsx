import useRequest from '@/hooks/useRequest'
import { Select } from 'antd'
import React, { useEffect } from 'react'

interface IRequestSelect {
  placeholder: string
  api: any
  params: any
  onSearch?: (value: string, preParams: any) => any
  value?: any
  onChange?: (value: any, option: any, options: any[]) => void
  formatData: ((data: any) => any) | undefined
  [x: string]: any
}

export default function RequestSelect ({
  placeholder,
  api,
  params,
  formatData,
  onSearch,
  value,
  onChange,
  ...props
}: IRequestSelect) {
  const request = useRequest(api, { manual: true, formatData })

  useEffect(() => {
    request.run(params)
  }, [params])

  return (<Select
    {...props}
    // showSearch
    value={value}
    placeholder={placeholder}
    loading={request.loading}
    onChange={(value, option) => {
      onChange?.(value, option, request.data)
    }}
    onSearch={(search: string) => {
      if (onSearch) {
        const newParams = onSearch(search, params)
        request.run(newParams)
      }
    }}
    options={request.data}
  />)
}
