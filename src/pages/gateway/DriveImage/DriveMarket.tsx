import React, { useEffect, useState, useContext, useCallback } from 'react'
import { Card, Tag, Typography, Space, Divider, Button, message, Tabs, Form, Input, Empty } from 'antd'
import { WebSocketProvider, WebSocketContext } from '@/components/WebSocket'
import { OperateStatusMap } from '@/utils/statusMap'
import { getDriverMarket } from '@/api'

import './style.less'
import { getDriveClassify } from '@/api/device-libraries'

const { useMessage } = message

export interface DriveMarketProps {}

export interface DriverMarketType {
  icon: string;
  id: string;
  is_internal: boolean;
  manual: string;
  name: string;
  description: string;
  operate_status: 'installing' | 'default' | 'installed' | 'uninstall';
  version: string;
  classify_id: string;
}

const CardItem = ({ id, params }: { id: string; params: { name?: string } }) => {
  const [items, setItems] = useState<DriverMarketType[]>([])
  const [loading, setLoading] = useState(false)
  const [messageApi] = useMessage()

  const key = 'updatable'

  const { ws } = useContext(WebSocketContext)

  const updateItemStatus = useCallback(
    (id: string, status: DriverMarketType['operate_status']) => {
      setItems(
        [...items].map((item) => {
          if (item.id === id) {
            item.operate_status = status
          }
          return item
        }),
      )
    },
    [items],
  )

  const getList = (name?: string) => {
    setLoading(true)
    getDriverMarket<DriverMarketType>({ name, classify_id: id })
      .then((resp) => {
        if (resp.success) {
          setItems(resp.result.list)
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  useEffect(() => {
    getList(params.name)
  }, [params.name])

  return (
    <div className="my-service p20 ">
      <Card loading={loading} bordered>
        <div className="responsive-layout">
          {items.map((item) => {
            const { color, icon, text } = OperateStatusMap[item.operate_status]
            return (
              <Card key={item.id} className="card-item" size="small" hoverable>
                <Tag color={color} icon={icon}>
                  {text}
                </Tag>
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
                    >
                      手册
                    </Button>
                    {(item.operate_status === 'default' || item.operate_status === 'uninstall' || item.operate_status === 'installing') && (
                      <Button
                        type="link"
                        loading={item.operate_status === 'installing'}
                        onClick={() => {
                          messageApi.open({ duration: 0, key, type: 'loading', content: '下载中..' })
                          updateItemStatus(item.id, 'installing')

                          ws
                            ?.send({
                              code: 10001,
                              data: { id: item.id, version: item.version },
                            })
                            .then((resp) => {
                              if (resp.data.success) {
                                messageApi.open({ key, type: 'success', content: resp.data.successMsg })
                              } else {
                                messageApi.open({ key, type: 'error', content: resp.data.errorMsg })
                              }

                              updateItemStatus(item.id, resp.data.result?.operate_status)
                            })
                        }}
                      >
                        下载
                      </Button>
                    )}
                  </Space>
                </div>
              </Card>
            )
          })}
        </div>

        {!items?.length && <Empty description="暂无数据"></Empty>}
      </Card>
    </div>
  )
}

const DriveMarket: React.FC<DriveMarketProps> = () => {
  const [, contextHolder] = useMessage()

  const [tabList, setTabList] = useState<{ id: string; name: string }[]>([])

  const [activeKey, setActiveKey] = useState<string | undefined>('')

  const getDriveList = async () => {
    try {
      const { result } = await getDriveClassify()
      const list = (result?.list || []) as { id: string; name: string }[]
      setTabList(list)
      setActiveKey(list[0]?.id)
    } catch {}
  }

  useEffect(() => {
    getDriveList()
  }, [])
  const [form] = Form.useForm()

  const [params, setParams] = useState<{ name?: string }>({})

  const search = () => {
    const values = form.getFieldsValue()
    setParams({ ...values })
  }

  const reset = () => {
    form.resetFields()
    search()
  }

  return (
    <>
      {contextHolder}
      <Form layout="inline" className="ml20" form={form}>
        <Form.Item key="name" name="name">
          <Input placeholder="名称"></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={search}>
            查询
          </Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={reset}>
            重置
          </Button>
        </Form.Item>
      </Form>
      <Tabs
        activeKey={activeKey}
        onChange={(e) => {
          setActiveKey(e)
        }}
        destroyInactiveTabPane={true}
        items={tabList?.map((item) => ({ key: item.id, label: item.name, children: <CardItem id={item.id} params={params}></CardItem> })) || []}
      ></Tabs>
    </>
  )
}

export default () => (
  <WebSocketProvider>
    <DriveMarket></DriveMarket>
  </WebSocketProvider>
)
