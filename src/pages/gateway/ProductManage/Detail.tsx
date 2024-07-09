import dayjs from 'dayjs'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Button, Card, Descriptions, Table, Tag, message, Space, Typography, Popconfirm, Form, Select, Input } from 'antd'
import { SyncOutlined, PlusOutlined, MinusCircleFilled, CheckCircleFilled } from '@ant-design/icons'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import { getProductInfo, deleteThingModel, productSync } from '@/api'
import { DetailModal, DetailModalRef } from './DeatilModal'
import { TypeSpecMap } from './helper'
import { ProductActions, ProductEvents, ProductInfo, ProductProperties, ProductThingModelType, TypeSpec } from './types'
import { get } from 'lodash'
import './style.less'
import { productRelease, productUnrelease } from '@/api/devices'

const { Text, Link } = Typography
const { useForm, useWatch } = Form
const { useMessage } = message

const TypeMap: {[key: string]: string} = {
  action: '服务类型',
  event: '事件类型',
  property: '属性类型',
}

const ProductDetail = () => {
  const params = useParams<{ id: string }>()
  const deatilModalRef = useRef<DetailModalRef>(null)
  const [messageApi, contextHolder] = useMessage()

  const [form] = useForm()
  const [submitting, setSubmitting] = useState(false)
  const [productInfo, setProductInfo] = useState<ProductInfo>()

  const isCloudProduct = useMemo(() => productInfo?.cloud_instance_id, [productInfo])

  const nameValue = useWatch('name', form)
  const typeValue = useWatch('type', form)

  const loadProductInfo = useCallback(() => {
    getProductInfo<ProductInfo>(params.id!)
      .then((resp) => {
        if (resp.success) {
          setProductInfo(resp.result)
        }
      }).catch((err) => {
        console.log(err)
      })
  }, [params])

  useEffect(() => {
    loadProductInfo()
  }, [params, loadProductInfo])

  const dataSource = useMemo<Array<ProductThingModelType>>(() => {
    if (!productInfo) return []

    const { actions, events, properties } = productInfo
    return [
      ...actions.map<ProductActions>(item => ({ ...item, type: 'action' })) || [],
      ...events.map<ProductEvents>(item => ({ ...item, type: 'event' })) || [],
      ...properties.map<ProductProperties>(item => ({ ...item, type: 'property' })) || [],
    ].filter(({ type, name }) => type.includes(typeValue) && name.includes(nameValue))
  }, [productInfo, nameValue, typeValue])

  return (
    <>
      {contextHolder}
      <DetailModal
        ref={deatilModalRef}
        productInfo={productInfo}
        onSuccess={() => {
          loadProductInfo()
        }}
      ></DetailModal>
      <AdvanceBreadcrumb
        hasBack
        title="产品管理"
        describe="产品物模型是对同一类设备的数字化抽象描述，描述该类设备是什么，能做什么，能对外提供哪些服务，它包括属性、事件、服务三种功能类型。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card className="product-info">
        <div className="product-info__body">
          <img src={require('@/assets/images/default.32752796.png')} alt="" />
          <div>
            <Descriptions
              className="product-info__descriptions"
              title={<>
                {productInfo?.name}
                <Popconfirm
                  title={productInfo?.status === '已发布' ? '是否确认取消发布？' : '是否确认发布？'}
                  okText="确认"
                  cancelText="取消"
                  onConfirm={() => {
                    if (productInfo?.status === '已发布') {
                      productUnrelease(productInfo?.id || '')
                        .then(resp => {
                          if (resp.success) {
                            messageApi.open({ type: 'success', content: '取消发布成功' })
                            loadProductInfo()
                          } else {
                            messageApi.open({ type: 'error', content: resp.errorMsg })
                          }
                        })
                    } else {
                      productRelease(productInfo?.id || '')
                        .then(resp => {
                          if (resp.success) {
                            messageApi.open({ type: 'success', content: '发布成功' })
                            loadProductInfo()
                          } else {
                            messageApi.open({ type: 'error', content: resp.errorMsg })
                          }
                        })
                    }
                  }}
                >
                  <Button
                    className="ml20"
                    size="small"
                  >
                    {productInfo?.status === '已发布' && <Space><CheckCircleFilled style={{ color: '#55af70' }} />已发布</Space>}
                    {productInfo?.status === '未发布' && <Space><MinusCircleFilled style={{ color: '#87909d' }} />未发布</Space>}
                  </Button>
                </Popconfirm>
              </>}
              column={2}
              extra={
                isCloudProduct && <Button
                  type="link"
                  size="small"
                  loading={submitting}
                  disabled={submitting}
                  icon={<SyncOutlined />}
                  style={{ fontSize: 12 }}
                  onClick={() => {
                    setSubmitting(true)
                    productSync({ product_id: params.id! })
                      .then((resp) => {
                        if (resp.success) {
                          message.success('同步成功')
                          loadProductInfo()
                        } else {
                          message.error(resp.errorMsg)
                        }
                      }).catch((err) => {
                        console.log(err)
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  }}
                >同步产品</Button>
              }
              labelStyle={{ fontSize: 12, color: '#8a949c' }}
              contentStyle={{ fontSize: 12 }}
            >
              <Descriptions.Item label="产品ID"><Text copyable>{productInfo?.id}</Text></Descriptions.Item>
              {isCloudProduct && <Descriptions.Item label="云端产品标识"><Text copyable>{productInfo?.cloud_product_id}</Text></Descriptions.Item>}
              <Descriptions.Item label="节点类型">{productInfo?.node_type}</Descriptions.Item>
              <Descriptions.Item label="数据来源">{productInfo?.platform}</Descriptions.Item>
              <Descriptions.Item label="数据格式">{productInfo?.data_format}</Descriptions.Item>
              <Descriptions.Item label="协议类型">{productInfo?.protocol}</Descriptions.Item>
              <Descriptions.Item label="创建时间">{dayjs(productInfo?.created_at).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>
              <Descriptions.Item label="厂商名称">{productInfo?.factory}</Descriptions.Item>
              {isCloudProduct && <Descriptions.Item label="最后一次同步时间">{dayjs(productInfo?.last_sync_time).format('YYYY-MM-DD HH:mm:ss')}</Descriptions.Item>}
              <Descriptions.Item label="描述">{productInfo?.description}</Descriptions.Item>
            </Descriptions>
          </div>
        </div>
      </Card>
      <Card className="m20">
        <Space className="mb15 align-center justify-space-between">
          <Form
            layout="inline"
            form={form}
            initialValues={{ type: '', name: '' }}
          >
            <Form.Item key="type" name="type">
              <Select
                placeholder="请选择云平台"
                style={{ minWidth: 180 }}
                options={[
                  { label: '功能类型 (全部)', value: '' },
                  { label: '属性', value: 'property' },
                  { label: '事件', value: 'event' },
                  { label: '服务', value: 'action' },
                ]}
              />
            </Form.Item>
            <Form.Item key="name" name="name">
              <Input allowClear placeholder="请输入产品名称搜索"></Input>
            </Form.Item>
          </Form>
          {
            productInfo && !isCloudProduct && (
              <Button
                type="primary"
                onClick={() => {
                  deatilModalRef.current?.open()
                }}
              ><PlusOutlined />添加物模型</Button>
            )
          }
        </Space>
        <Table
          dataSource={dataSource}
          bordered
          rowKey="id"
          size="small"
          pagination={{
            size: 'small',
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            total: dataSource.length,
          }}
          columns={[
            {
              title: '功能类型',
              key: 'type',
              dataIndex: 'type',
              render (value, record) {
                return (
                  <>
                    <span>{TypeMap[value as string]}</span>
                    {record?.tag && <Tag color="default" className="ml10">{record?.tag}</Tag>}
                  </>
                )
              },
            },
            { title: '功能名称', key: 'name', dataIndex: 'name' },
            { title: '标识符', key: 'code', dataIndex: 'code' },
            {
              title: '数据类型',
              key: 'type_spec_type',
              dataIndex: 'type_spec_type',
              render (value, record) {
                const type = get<ProductThingModelType, string, TypeSpec | ''>(record, 'type_spec.type', '') as TypeSpec
                return TypeSpecMap[type] || '-'
              },
            },
            {
              title: '数据定义',
              key: 'type_spec_specs',
              dataIndex: 'type_spec_specs',
              render (value, record) {
                const type = get<ProductThingModelType, string, TypeSpec | ''>(record, 'type_spec.type', '') as TypeSpec
                const specs = get<ProductThingModelType, string, string>(record, 'type_spec.specs', '{}') as TypeSpec

                if (type === 'array') {
                  return '数组个数: ' + JSON.parse(specs)?.size
                } else if (type === 'text') {
                  return '数据长度: ' + JSON.parse(specs)?.length
                } else if (type === 'date') {
                  return '整数类型Int64的UTC时间戳 (毫秒)'
                } else if (type === 'bool' || type === 'enum') {
                  return Object.entries(JSON.parse(specs))
                    .map(([k, v]) => `${k}-${v}`)
                    .map((text, index) => <Tag color="processing" key={index}>{text}</Tag>)
                } else if (type === 'int' || type === 'float') {
                  const specsObj = JSON.parse(specs)
                  return (
                    <>
                      <div>取值范围: {specsObj?.min}-{specsObj?.max}</div>
                      <div>步长: {specsObj?.step}</div>
                      <div>单位: {specsObj?.unit} ({specsObj?.unitName})</div>
                    </>
                  )
                }
                return '-'
              },
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Link
                      onClick={() => {
                        deatilModalRef.current?.open(record)
                      }}
                    >查看</Link>
                    <Popconfirm
                      title="此操作将永久删除该记录, 是否继续?"
                      okText="删除"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteThingModel({
                          thing_model_id: record?.id,
                          thing_model_type: record?.type,
                        }).then(resp => {
                          if (resp.success) {
                            message.success('删除成功')
                            loadProductInfo()
                          } else {
                            message.error(resp?.errorMsg)
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

export default ProductDetail
