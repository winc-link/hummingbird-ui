import dayjs from 'dayjs'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Table, Card, Form, Input, Select, Button, Space, message, Typography, Popconfirm, Badge } from 'antd'
import { PlusOutlined, ReloadOutlined, CheckCircleFilled, MinusCircleFilled } from '@ant-design/icons'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import { getProductList, allProductSync, deleteProduct, useGetIotPlatform, useGetCloudInstance } from '@/api'
import { useTableRequest } from '@/hooks'
import { AddModal, AddModalRef } from './AddModal'
import { RunStatusMap } from '@/utils/statusMap'
import { ProductType } from '@/api/product'

const { Text } = Typography
const { useMessage } = message

export interface ProductManageProps {

}

// const NodeTypeMap: {[key: string]: string} = {
//   0: '未知类型',
//   1: '网关',
//   2: '直连设备',
//   3: '网管子设备',
// }

const ProductManage: React.FC<ProductManageProps> = () => {
  const [match] = useSearchParams()
  useEffect(() => {
    match.has('create') && addModalRef.current?.open()
  }, [])

  const navigate = useNavigate()

  const addModalRef = useRef<AddModalRef>(null)
  const [submitting, setSubmitting] = useState(false)
  const [cloudInstanceId, setCloudInstanceId] = useState('')

  const key = 'updatable'
  const [messageApi, contextHolder] = useMessage()

  const { loading, form, dataSource, pagination, reload, search, reset } = useTableRequest<ProductType>({
    onRequest: getProductList,
  })

  const { data: iotPlatformOptions } = useGetIotPlatform()
  const { data: cloudInstanceOptions } = useGetCloudInstance()

  useEffect(() => {
    setCloudInstanceId(cloudInstanceOptions[0]?.id)
  }, [cloudInstanceOptions])

  return (
    <>
      {contextHolder}
      <AddModal ref={addModalRef} onFinish={search} />
      <AdvanceBreadcrumb
        title="产品管理"
        describe="在物联网平台中，某一类具有相同能力或特征的设备的合集被称为一款产品。赢创万联已经打通了市面上主流iot云平台，可以把云平台产品数据同步到本地，第一次使用请点击数据同步按钮进行数据同步。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card className="m20" size="small">
        <Form layout="inline" form={form}>
          <Form.Item key="platform" name="platform" initialValue={''}>
            <Select
              placeholder="请选择云平台"
              style={{ minWidth: 180 }}
              options={[{ label: '云平台 (全部)', value: '' }, ...iotPlatformOptions.map(i => ({ label: i, value: i }))]}
            />
          </Form.Item>
          <Form.Item key="name" name="name">
            <Input placeholder="产品名称"></Input>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={search}>查询</Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={reset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="m20" size="small">
        <Space className="mb15 justify-space-between">
          <Button
            type="primary"
            onClick={() => {
              addModalRef.current?.open()
            }}
          ><PlusOutlined />创建产品</Button>
          <div className="flex-center">
            <Space.Compact block>
              <Select
                style={{ minWidth: 180 }}
                options={cloudInstanceOptions.map(item => ({
                  value: item.id,
                  label: (
                    <>
                      <span className="mr10">{item.name}</span>
                    [ <Badge status={RunStatusMap[item.run_status].status} text={RunStatusMap[item.run_status].text} /> ]
                    </>
                  ),
                }))}
                value={cloudInstanceId}
                placeholder="请选择云实例"
                dropdownMatchSelectWidth={false}
                onChange={value => {
                  setCloudInstanceId(value)
                }}
              />
              <Button
                type="default"
                loading={submitting}
                disabled={submitting}
                onClick={() => {
                  if (cloudInstanceId) {
                    setSubmitting(true)
                    messageApi.open({ key, type: 'loading', content: '产品数据同步中, 请等待 ..' })
                    allProductSync({ cloud_instance_id: cloudInstanceId })
                      .then(resp => {
                        if (resp.success) {
                          messageApi.open({ key, type: 'success', content: '产品数据同步成功', duration: 3 })
                          reload()
                        } else {
                          messageApi.open({ key, type: 'error', content: resp.errorMsg, duration: 3 })
                        }
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  } else {
                    messageApi.open({ type: 'error', content: '请选择要同步的云实例' })
                  }
                }}
              >数据同步</Button>
            </Space.Compact>
            <Button className="ml10"
              onClick={() => {
                reload()
              }}
            ><ReloadOutlined />刷新</Button>
          </div>
        </Space>
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '产品名称', key: 'name', dataIndex: 'name' },
            {
              title: '产品编号',
              key: 'product_id',
              dataIndex: 'product_id',
              render (value) {
                return value ? <Text copyable={{ tooltips: ['复制', '复制成功'] }}>{value}</Text> : null
              },
            },
            { title: '类型', key: 'node_type', dataIndex: 'node_type' },
            { title: '云平台', key: 'platform', dataIndex: 'platform' },
            {
              title: '创建时间',
              key: 'created_at',
              dataIndex: 'created_at',
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '状态',
              key: 'status',
              dataIndex: 'status',
              render: (value) => {
                if (value === '未发布') return <Space><MinusCircleFilled style={{ color: '#87909d' }} />未发布</Space>
                if (value === '已发布') return <Space><CheckCircleFilled style={{ color: '#55af70' }} />已发布</Space>
                return '-'
              },
              // render (value, record) {
              //   return (
              //     <>
              //       {value && <Badge color={({
              //         已发布: 'green',
              //         未发布: 'gray',
              //       })[record.status]} />}
              //       <Text className="ml5">{value || '-'}</Text>
              //     </>
              //   )
              // },
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Typography.Link
                      onClick={() => {
                        navigate(`/gateway/product/detail/${record?.id}`)
                      }}
                    >详情</Typography.Link>
                    <Typography.Link
                      onClick={() => {
                        navigate(`/gateway/device/manage/${record?.id}`)
                      }}
                    >管理设备</Typography.Link>
                    <Popconfirm
                      title="此操作将永久删除该条记录, 是否继续?"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteProduct(record?.id)
                          .then(resp => {
                            if (resp.success) {
                              messageApi.open({ type: 'success', content: '删除成功' })
                              reload()
                            } else {
                              messageApi.open({ type: 'error', content: resp.errorMsg })
                            }
                          })
                      }}
                    >
                      <Typography.Link>删除</Typography.Link>
                    </Popconfirm>
                  </Space>
                )
              },
            },
          ]}
        />
      </Card>
    </>
  )
}

export default ProductManage
