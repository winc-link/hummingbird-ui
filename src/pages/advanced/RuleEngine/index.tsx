import dayjs from 'dayjs'
import React, { useRef, useState } from 'react'
import { Table, Card, Form, Input, Select, Button, Space, message, Typography, Popconfirm, Switch, Drawer, Steps, Row, Col } from 'antd'
import { CloseOutlined, SyncOutlined, PlusOutlined } from '@ant-design/icons'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import { getRuleEngine, DataRuleEngine, deleteRuleEngine, startRuleEngine, stopRuleEngine, getRuleEngineInfo, statusRuleEngine, getDataResource } from '@/api'
import { useTableRequest } from '@/hooks'
import { useParams } from 'react-router-dom'
// import { AddVisuaRule, AddVisuaRuleRef } from './components/AddVisuaRule'
import { AddDirectRule, AddDirectRuleRef } from './components/AddDirectRule'
import CodeHighlighter from '@/components/CodeHighlighter/CodeHighlighter'
import useRequest from '@/hooks/useRequest'

const { Text } = Typography
const { useMessage } = message

export interface DevicesManageProps {

}

const DevicesManage: React.FC<DevicesManageProps> = () => {
  // const navigate = useNavigate()
  const params = useParams<{ id?: string }>()
  console.log(params?.id)

  const [messageApi, contextHolder] = useMessage()
  // const AddVisuaRuleRef = useRef<AddVisuaRuleRef>(null)
  const AddDirectRuleRef = useRef<AddDirectRuleRef>(null)

  const getRuleEngineInfoApi = useRequest(getRuleEngineInfo, { manual: true })
  const statusRuleEngineApi = useRequest(statusRuleEngine, { manual: true })
  const dataResourceApi = useRequest(getDataResource, { manual: true })

  // 获取表格数据接口
  const { loading, dataSource, pagination, form, reload, search, reset } = useTableRequest<DataRuleEngine>({
    onRequest: (params) => {
      return getRuleEngine({
        ...params,
        start_time: params.time?.[0].valueOf(),
        end_time: params.time?.[1].valueOf(),
        time: undefined,
      })
    },
  })
  console.log('dataSource', dataSource)

  const [open, setOpen] = useState(false)

  const showDrawer = async ({ id }: { id: string }) => {
    statusRuleEngineApi.run(id)
    const res = await getRuleEngineInfoApi.run(id)
    dataResourceApi.run({ type: res?.dataResource?.type })
    setOpen(true)
  }

  const onClose = () => {
    setOpen(false)
  }

  return (
    <>
      {contextHolder}
      {/* <AddVisuaRule ref={AddVisuaRuleRef} onFinish={reload}></AddVisuaRule> */}
      <AddDirectRule ref={AddDirectRuleRef} onFinish={reload}></AddDirectRule>
      <AdvanceBreadcrumb
        title="规则引擎"
        describe="规则引擎提供数据流转能力，可对接入平台的设备数据进行过滤转换，并将数据推送至用户指定的消息目的地。规则引擎流转规则需要配置消息源（推送消息类型）、条件过滤规则及消息目的地（推送方式）。"
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card className="m20" size="small">
        <Form
          layout="inline"
          form={form}
        >
          {/* <Form.Item key="time" name="time" label="">
            <RangePicker
              style={{ width: 300 }}
              showTime={{ format: 'HH:mm:ss' }}
              format="YYYY-MM-DD HH:mm:ss"
              placeholder={['开始时间', '结束时间']}
            />
          </Form.Item> */}
          <Form.Item key="status" name="status">
            <Select
              style={{ width: 120 }}
              placeholder="启用状态"
              options={[
                { label: '状态 (全部)', value: '' },
                { label: '启用', value: 'running' },
                { label: '禁用', value: 'stopped' },
              ]}
            />
          </Form.Item>
          <Form.Item key="name" name="name" label="规则名称">
            <Input style={{ width: 220 }} placeholder="搜索规则" allowClear></Input>
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
          <div>
            {/* <Button
              // type="primary"
              onClick={() => {
                AddVisuaRuleRef.current?.open()
              }}
            >可视化添加规则</Button> */}
            <Button
              type="primary"
              onClick={() => {
                AddDirectRuleRef.current?.open()
              }}
            ><PlusOutlined />添加规则</Button>
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
            { title: '设备名称', key: 'name', dataIndex: 'name' },
            { title: '规则描述', key: 'description', dataIndex: 'description' },
            {
              title: '转发方式',
              key: 'dataResource',
              dataIndex: 'dataResource',
              render (dataResource) {
                return dataResource.type
              },
            },
            {
              title: '创建时间',
              key: 'created',
              dataIndex: 'created',
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '启用状态',
              key: 'status',
              dataIndex: 'status',
              render: (status, r) => <StatusSwitch status={status} id={r.id} onSuccess={() => reload()} />,
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Typography.Link
                      onClick={() => showDrawer({ id: record.id })}
                    >详情</Typography.Link>
                    <Typography.Link
                      onClick={() => {
                        AddDirectRuleRef.current?.open(record.id)
                      }}
                    >编辑</Typography.Link>
                    <Popconfirm
                      title="您确定要删除该规则吗？"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteRuleEngine(record?.id)
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
      <Drawer
        title="规则详情"
        placement="right"
        onClose={onClose}
        open={open}
        width={900}
        closable={false}
        maskClosable={false}
        headerStyle={{ height: 51 }}
        destroyOnClose
        extra={<CloseOutlined onClick={onClose} />}
        footer={
          <Space>
            <Button onClick={onClose}>关闭</Button>
          </Space>
        }
      >
        <Row gutter={16}>
          <Col span={14}>
            <Steps
              direction="vertical"
              size="small"
              current={2}
              items={[
                {
                  title: '条件过滤',
                  description: <>
                    {/* <Row className="mt20 mb10">
                      <Col span={4}>产品筛选：</Col>
                      <Col span={20}>指定产品 | 侧风机</Col>
                    </Row> */}
                    <Row className="mt20 mb10">
                      <Col span={4}>消息源：</Col>
                      <Col span={20}>{getRuleEngineInfoApi.data?.filter?.message_source}</Col>
                    </Row>
                    <Row className="mb10">
                      <Col span={4}>查询语句：</Col>
                      <Col span={20}><CodeHighlighter value={getRuleEngineInfoApi.data?.filter?.sql} /></Col>
                    </Row>
                  </>,
                },
                {
                  title: '转发方式',
                  description: <>
                    <Row className="mt20 mb10">
                      <Col span={4}>转发方式：</Col>
                      <Col span={20}>{getRuleEngineInfoApi.data?.dataResource?.type}</Col>
                    </Row>
                    <Row className="mb10">
                      <Col span={4}>使用资源：</Col>
                      <Col span={20}>{(dataResourceApi.data?.list || []).filter((item: { id: string }) => item.id === getRuleEngineInfoApi.data?.data_resource_id)?.[0]?.name}</Col>
                    </Row>
                  </>,
                },
              ]}
            />
          </Col>
          <Col span={10}>
            <pre style={{
              height: 'calc(100vh - 150px)',
              overflowY: 'auto',
              tabSize: 2,
              backgroundColor: '#333',
              color: '#fff',
              padding: '10px',
              position: 'relative',
              boxSizing: 'border-box',
            }}>
              {statusRuleEngineApi.data && JSON.stringify(statusRuleEngineApi.data, null, '\t')}
              <Button
                shape="circle"
                icon={<SyncOutlined />}
                loading={statusRuleEngineApi.loading}
                onClick={() => statusRuleEngineApi.run(getRuleEngineInfoApi.data.id)}
                style={{
                  position: 'absolute',
                  right: '10px',
                  bottom: '10px',
                }}
              />
            </pre>
          </Col>
        </Row>
      </Drawer>
    </>
  )
}

export default DevicesManage
enum EStatus {
  stopped = 'stopped',
  running = 'running',
}
function StatusSwitch ({ status, id, onSuccess }: { status: EStatus, id: string, onSuccess: () => void }) {
  const startSceneApi = useRequest(startRuleEngine, { manual: true })
  const stopSceneApi = useRequest(stopRuleEngine, { manual: true })
  console.log('status', status)

  return (<Switch
    checked={status === EStatus.running}
    checkedChildren="开"
    unCheckedChildren="关"
    loading={stopSceneApi.loading}
    onChange={async (bool) => {
      console.log(bool)
      try {
        if (bool) {
          await startSceneApi.run(id)
        } else {
          await stopSceneApi.run(id)
        }
        onSuccess?.()
      } catch (error) {
        console.log(error)
      }
    }}
  />)
}
