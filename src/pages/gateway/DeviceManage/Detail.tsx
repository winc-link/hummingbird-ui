import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { Badge, Button, Card, Descriptions, message, Tabs, Typography } from 'antd'
import { EyeOutlined, EyeInvisibleOutlined, SyncOutlined } from '@ant-design/icons'
import { getDeviceDetail, getProductInfo } from '@/api'
import { deviceSyncSingle, IDeviceDetail } from '@/api/device'
import { DetailTab1 } from './components/Tab1'
import { DetailTab2 } from './components/Tab2'
import { DetailTab3 } from './components/Tab3'
import './style.less'
import dayjs from 'dayjs'
import { ProductInfo } from './types'

const { Text, Link } = Typography

export interface DeviceDetailProps {

}

export const DeviceDetail:React.FC<DeviceDetailProps> = () => {
  const [searchParams] = useSearchParams()
  const params = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [activeKey, setActiveKey] = useState('1')
  const [detail, setDetail] = useState<IDeviceDetail>()
  const [visible, setVisible] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState(false)

  const isCloudDevice = useMemo(() => detail?.cloud_device_id, [detail])

  useEffect(() => {
    const trigger = decodeURIComponent(searchParams.get('trigger') || '')
    const mapping: { [x:string]: string } = {
      设备数据触发: '1',
      设备事件触发: '2',
    }
    trigger && mapping[trigger] && setActiveKey(mapping[trigger])
  }, [])

  const loadDetail = useCallback(() => {
    getDeviceDetail(params.id!).then(resp => {
      if (resp.success) {
        setDetail(resp.result)
        loadProductInfo(resp.result)
      }
    })
  }, [params])

  useEffect(() => {
    loadDetail()
  }, [])

  // 获取产品详情
  const [productInfo, setProductInfo] = useState<ProductInfo>()
  const loadProductInfo = useCallback((detail?: IDeviceDetail) => {
    getProductInfo<ProductInfo>(detail?.product_id!)
      .then((resp) => {
        if (resp.success) {
          setProductInfo(resp.result)
        }
      }).catch((err) => {
        console.log(err)
      })
  }, [params])
  console.log('productInfo', productInfo)

  return (
    <>
      <AdvanceBreadcrumb
        hasBack
        title={
          <div className="flex-center">
            <Text style={{ fontSize: 17 }} copyable>{detail?.name || '设备详情'}</Text>
          </div>
        }
        describe="设备详情提供设备基础信息及物模型相关数据（包括设备属性功能记录、事件记录及服务调用记录）查询。"
        background={require('@/assets/images/head-bg.8b029587.png')}
        breadcrumb={[
          { label: '设备管理', to: '/gateway/device/manage' },
          { label: `设备详情 [ ${detail?.name || ''} ]`, to: '' },
        ]}
      />
      <Card className="product-info">
        <Descriptions
          className="product-info__descriptions"
          title={'设备信息'}
          column={3}
          labelStyle={{ fontSize: 12, color: '#8a949c' }}
          contentStyle={{ fontSize: 12 }}
          extra={
            isCloudDevice && <Button
              type="link"
              size="small"
              loading={submitting}
              disabled={submitting}
              icon={<SyncOutlined />}
              style={{ fontSize: 12 }}
              onClick={() => {
                setSubmitting(true)
                deviceSyncSingle({ device_id: params.id! })
                  .then((resp) => {
                    if (resp.success) {
                      message.success('同步成功')
                      loadDetail()
                    } else {
                      message.error(resp.errorMsg)
                    }
                  }).catch((err) => {
                    console.log(err)
                  }).finally(() => {
                    setSubmitting(false)
                  })
              }}
            >同步设备</Button>
          }
        >
          <Descriptions.Item label="设备所属产品">
            <Link
              style={{ fontSize: 12 }}
              onClick={() => {
                navigate(`/gateway/product/detail/${detail?.product_id}`)
              }}
            >{detail?.product_name}</Link>
          </Descriptions.Item>
          <Descriptions.Item label="设备状态" span={2}>
            <Badge color={{
              在线: 'green',
              离线: 'gray',
              禁用: 'red',
              未激活: 'orange',
            }[detail?.status as string] || 'gray'} />
            <Text className="ml5" style={{ fontSize: 12 }}>{detail?.status || '未知'}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="设备名称">{detail?.name}</Descriptions.Item>
          <Descriptions.Item label="设备ID" span={2}>
            <Text style={{ fontSize: 12 }} copyable>{detail?.id}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="平台">{detail?.platform}</Descriptions.Item>
          <Descriptions.Item label="设备密钥" span={2}>
            {
              detail?.secret && (
                <>
                  {
                    visible
                      ? (
                        <>
                          <Text style={{ fontSize: 12 }} className="mr10" copyable>{detail?.secret}</Text>
                          <EyeInvisibleOutlined onClick={() => setVisible(!visible)} />
                        </>
                      )
                      : (
                        <>
                          <span className="mr10">{new Array(detail?.secret.length).fill(null).map(() => '*')}</span>
                          <EyeOutlined onClick={() => setVisible(!visible)} />
                        </>
                      )
                  }
                </>
              )
            }
          </Descriptions.Item>
          <Descriptions.Item label="关联驱动名称">{detail?.device_service_name}</Descriptions.Item>
          {
            isCloudDevice && (
              <Descriptions.Item label="云端设备标识" span={2}>
                <Text style={{ fontSize: 12 }} copyable>{detail?.cloud_device_id}</Text>
              </Descriptions.Item>
            )
          }
          <Descriptions.Item label="最近在线时间">
            {detail?.last_online_time ? dayjs(detail?.last_online_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
          </Descriptions.Item>
          {
            isCloudDevice && (
              <Descriptions.Item label="最后一次同步时间">
                {detail?.last_sync_time ? dayjs(detail?.last_sync_time).format('YYYY-MM-DD HH:mm:ss') : '-'}
              </Descriptions.Item>
            )
          }
          <Descriptions.Item label="描述">{detail?.description}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Tabs
        className="device-property mt20"
        type="card"
        destroyInactiveTabPane
        activeKey={activeKey}
        onChange={(activeKey) => setActiveKey(activeKey)}
        items={[
          {
            key: '1',
            label: '属性',
            children: <DetailTab1></DetailTab1>,
          },
          {
            key: '2',
            label: '事件记录',
            children: <DetailTab2 events={productInfo?.events || []}></DetailTab2>,
          },
          {
            key: '3',
            label: '服务记录',
            children: <DetailTab3 actions={productInfo?.actions || []}></DetailTab3>,
          },
        ]}
      />
    </>
  )
}

export default DeviceDetail
