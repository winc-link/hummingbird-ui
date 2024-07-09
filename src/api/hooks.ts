import { useEffect, useState } from 'react'
import { CloudInstance, cloudInstance } from './cloud-instance'
import { DeviceServers, getDeviceServers } from './device-servers'
import { getDeviceStatusTemplate } from './device'
import { getProductList, iotPlatform, ProductType } from './product'

export const useGetDeviceStatusTemplate = () => {
  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    getDeviceStatusTemplate().then(({ success, result }) => {
      if (success) {
        setData(result)
      }
    })
  }, [])

  return { data }
}

export const useGetIotPlatform = () => {
  const [data, setData] = useState<string[]>([])

  useEffect(() => {
    iotPlatform().then(({ success, result }) => {
      if (success) {
        setData(result)
      }
    })
  }, [])

  return { data }
}

export const useGetCloudInstance = () => {
  const [data, setData] = useState<CloudInstance[]>([])

  useEffect(() => {
    cloudInstance().then(({ success, result }) => {
      if (success) {
        setData(result.list)
      }
    })
  }, [])

  return { data }
}

export const useGetDeviceServers = (params: object) => {
  const [data, setData] = useState<DeviceServers[]>([])

  useEffect(() => {
    getDeviceServers({ isAll: true, ...params }).then(({ success, result }) => {
      if (success) {
        setData(result.list)
      }
    })
  }, [])

  return { data }
}

export const useGetProductList = (params: {
  isAll?: boolean
  platform?: string
}) => {
  const [data, setData] = useState<ProductType[]>([])

  useEffect(() => {
    getProductList(params).then(({ success, result }) => {
      if (success) {
        setData(result.list)
      }
    })
  }, [])

  return { data }
}
