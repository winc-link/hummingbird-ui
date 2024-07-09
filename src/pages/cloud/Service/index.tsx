import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Card, Tag, Typography, Space, Divider, Button, message } from 'antd'
import AdvanceBreadcrumb from '@/components/Breadcrumb/AdvanceBreadcrumb'
import { WebSocketProvider, WebSocketContext } from '@/components/WebSocket'
import { OperateStatusMap } from '@/utils/statusMap'
import { cloudService } from '@/api'

import './style.less'

const { useMessage } = message

export interface ServiceMarketProps {

}

export interface ServiceItemType {
  icon: string
  id: string
  is_internal: boolean
  manual: string
  name: string
  description: string
  operate_status: 'installing' | 'default' | 'installed' | 'uninstall'
  version: string
}

const ServiceMarket: React.FC<ServiceMarketProps> = () => {
  const [items, setItems] = useState<ServiceItemType[]>([])
  const [loading, setLoading] = useState(false)
  const [messageApi, contextHolder] = useMessage()

  const key = 'updatable'

  const { ws } = useContext(WebSocketContext)

  const updateItemStatus = useCallback((id: string, status: ServiceItemType['operate_status']) => {
    setItems([...items].map(item => {
      if (item.id === id) {
        item.operate_status = status
      }
      return item
    }))
  }, [items])

  useEffect(() => {
    setLoading(true)
    cloudService<ServiceItemType>()
      .then((resp) => {
        if (resp.success) {
          setItems(resp.result.list)
        }
      })
      .catch((err) => {
        console.log(err)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  return (
    <>
      {contextHolder}
      <AdvanceBreadcrumb
        title="插件市场"
        describe="赢创万联物联网平台提供云插件功能，支持把设备数据上报到各大物联网平台中。赢创万联平台屏蔽了个大厂商协议的差异性，相同的sdk方法可以支持多个物联网平台，用户可按需下载进行使用。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <div className="my-service p20">
        <Card loading={loading} bordered>
          <div className="responsive-layout">
            {
              items.map((item) => {
                const { color, icon, text } = OperateStatusMap[item.operate_status]
                return (
                  <Card key={item.id} className="card-item" size="small" hoverable>
                    <Tag color={color} icon={icon}>{text}</Tag>
                    <div className="flex-center">
                      <div className="logo" style={{ backgroundImage: `url(${item.icon})` }}></div>
                    </div>
                    <div className="flex justify-center title">
                      <Typography.Title level={5}>{item.name}</Typography.Title>
                    </div>
                    <div className="flex justify-center">
                      <Space split={<Divider type="vertical" />}>
                        <Button
                          type="link"
                          onClick={() => {
                            window.open(item.manual)
                          }}
                        >手册</Button>
                        {(
                          item.operate_status === 'default'
                          || item.operate_status === 'uninstall'
                          || item.operate_status === 'installing'
                        ) && (
                          <Button
                            type="link"
                            disabled={item.operate_status === 'installing'}
                            loading={item.operate_status === 'installing'}
                            onClick={() => {
                              messageApi.open({ duration: 0, key, type: 'loading', content: '下载中..' })
                              updateItemStatus(item.id, 'installing')

                              ws?.send({
                                code: 20001,
                                data: {
                                  id: item.id,
                                  version: item.version,
                                },
                              }).then(resp => {
                                console.log(resp)
                                if (resp.data.success) {
                                  messageApi.open({ key, type: 'success', content: resp.data.successMsg })
                                } else {
                                  messageApi.open({ key, type: 'error', content: resp.data.errorMsg })
                                }

                                updateItemStatus(item.id, resp.data.result?.operate_status)
                              })
                            }}
                          >下载</Button>
                        )}
                      </Space>

                    </div>
                  </Card>
                )
              })
            }
          </div>
        </Card>
      </div>
    </>
  )
}

export default () => (
  <WebSocketProvider>
    <ServiceMarket></ServiceMarket>
  </WebSocketProvider>
)
