import dayjs from 'dayjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Card, Col, Divider, Empty, Form, Row, Switch, Typography } from 'antd'
import { HistoryOutlined } from '@ant-design/icons'
import { getDeviceProperty } from '@/api'
import { Tab1Modal, Tab1ModalRef } from './Tab1Modal'
import { DeviceProperty } from '@/api/device-thingmodel'
import { isNull } from 'lodash'

const { Text, Title } = Typography

export interface DetailTab1Props {

}

export const DetailTab1: React.FC<DetailTab1Props> = () => {
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const timer = useRef<ReturnType<typeof setInterval>>()
  const tab1ModalRef = useRef<Tab1ModalRef>(null)

  const [lists, setLists] = useState<DeviceProperty[]>([])
  const [checked, setChecked] = useState<boolean>(false)

  const load = useCallback(() => {
    getDeviceProperty(params.id!).then(resp => {
      if (resp.success) {
        setLists(resp.result)

        const code = searchParams.get('code')
        console.log('code', code)
        if (code) {
          const item = resp.result.find((item) => item.code === code)
          console.log('item', item, tab1ModalRef.current?.open)
          item && setTimeout(() => tab1ModalRef.current?.open(item), 0)
        }
      }
    })
  }, [params])

  useEffect(() => {
    if (checked) {
      timer.current = setInterval(() => {
        load()
      }, 3000)
    } else {
      clearInterval(timer.current)
    }

    return () => {
      clearInterval(timer.current)
    }
  }, [checked])

  useEffect(() => {
    load()
  }, [])

  if (!lists.length) {
    return <Empty />
  }

  return (
    <>
      <Tab1Modal ref={tab1ModalRef}></Tab1Modal>
      <div className="mb10" style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Form layout="inline">
          <Form.Item label="实时刷新">
            <Switch checked={checked} onChange={setChecked}/>
          </Form.Item>
        </Form>
      </div>
      <Row gutter={[6, 6]}>
        {
          lists.map((item, index) => {
            return (
              <Col span={6} key={index}>
                <Card hoverable size="small">
                  <div className="justify-space-between">
                    <div>
                      <Text style={{ color: '#87909d', fontSize: 13 }}>{item.name}</Text>
                    </div>
                    <div>
                      <Text
                        className="on-hover"
                        style={{ fontSize: 12 }}
                        onClick={() => {
                          tab1ModalRef.current?.open(item)
                        }}
                      >
                        <HistoryOutlined className="mr5" />
                        历史数据
                      </Text>
                    </div>
                  </div>
                  <div className="mt10 mb20">
                    <Title level={5} ellipsis={{ tooltip: isNull(item.value) ? '-' : String(item.value) }}>
                      {isNull(item.value) ? '-' : String(item.value)}
                      {item.unit && <> ({item.unit})</>}
                    </Title>
                  </div>
                  <div className="mt20">
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {dayjs(item.time).format('YYYY-MM-DD HH:mm:ss')}
                      <Divider type="vertical" />
                      {item.data_type}
                      <Divider type="vertical" />
                      {item.access_mode === 'R' && '只读'}
                      {item.access_mode === 'RW' && '读写'}
                    </Text>
                  </div>
                </Card>
              </Col>
            )
          })
        }
      </Row>
    </>
  )
}

export default DetailTab1
