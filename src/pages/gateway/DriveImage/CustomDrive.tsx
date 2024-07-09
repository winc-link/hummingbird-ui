import dayjs from 'dayjs'
import React, { useRef, useState } from 'react'
import { Button, Card, Popconfirm, Space, Table, Typography, message, Badge, Form, Input, Tag } from 'antd'
import { PlusOutlined } from '@ant-design/icons'
import { getDeviceLibraries, deleteDeviceLibraries } from '@/api'
import { useTableRequest } from '@/hooks'
import { OperateStatusMap } from '@/utils/statusMap'
import { AddModal, AddModalRef } from './AddModal'
import { UpdateModal } from './UpdateModal'
import { WebSocketProvider } from '@/components/WebSocket'
import { DeviceLibraries } from '@/api/device-libraries'

const { Text } = Typography
const { useMessage } = message

export interface CustomDriveProps {

}

const CustomDrive: React.FC<CustomDriveProps> = () => {
  const [messageApi, contextHolder] = useMessage()
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const addModalRef = useRef<AddModalRef>(null)

  const { loading, dataSource, pagination, form, reload, search, reset } = useTableRequest<DeviceLibraries>({
    onRequest: (params) => getDeviceLibraries({ ...params, is_internal: false }),
  })

  return (
    <>
      {contextHolder}
      <AddModal ref={addModalRef} onFinish={reload}></AddModal>
      <Form layout="inline" className="ml20" form={form}>
        <Form.Item key="name" name="name">
          <Input placeholder="驱动镜像名称"></Input>
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={search}>查询</Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={reset}>重置</Button>
        </Form.Item>
      </Form>
      <Card className="m20" size="small">
        <Space className="mb15 justify-space-between">
          <Button
            type="primary"
            onClick={() => {
              addModalRef.current?.open()
            }}
          ><PlusOutlined />新增</Button>
        </Space>
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '镜像编号', key: 'id', dataIndex: 'id' },
            { title: '镜像名称', key: 'name', dataIndex: 'name' },
            {
              title: '类型',
              key: 'support_versions',
              dataIndex: 'support_versions',
              render (value, { support_versions }) {
                return support_versions[0]?.is_default ? <Tag color="green">官方</Tag> : <Tag color="blue">自定义</Tag>
              },
            },
            { title: '版本', key: 'version', dataIndex: 'version' },
            { title: '协议', key: 'protocol', dataIndex: 'protocol' },
            {
              title: '状态',
              key: 'operate_status',
              dataIndex: 'operate_status',
              render (value, { operate_status }) {
                const { status, text } = OperateStatusMap[operate_status]
                return (
                  <Badge status={status} text={text} />
                )
              },
            },
            {
              title: '创建时间',
              key: 'created',
              dataIndex: 'created',
              width: 170,
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              width: 170,
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <UpdateModal
                      record={record}
                      selectedRowKeys={selectedRowKeys}
                      onFinish={reload}
                      onChange={(id) => {
                        setSelectedRowKeys([id])
                      }}
                    ></UpdateModal>
                    <Typography.Link
                      onClick={() => {
                        addModalRef.current?.open(record)
                      }}
                    >编辑</Typography.Link>
                    <Popconfirm
                      title="此操作将永久删除该条记录, 是否继续?"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteDeviceLibraries(record?.id)
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

export default () => (
  <WebSocketProvider>
    <CustomDrive></CustomDrive>
  </WebSocketProvider>
)
