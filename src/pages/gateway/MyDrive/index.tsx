import dayjs from 'dayjs'
import React, { useCallback, useState, useContext, useRef } from 'react'
import { Card, Dropdown, Popconfirm, Space, Table, Typography, Badge, Tag, Form, Input, Button, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { NormalBreadcrumb } from '@/components/Breadcrumb'
import { WebSocketProvider, WebSocketContext } from '@/components/WebSocket'
import { getDeviceServers } from '@/api'
import { useTableRequest } from '@/hooks'
import LogModal, { LogModalRef } from './LogModal'
import { RunStatusMap } from '@/utils/statusMap'
import { EditModal, EditModalRef } from './EditModal'
import { DeviceServers } from '@/api/device-servers'

const { Text } = Typography

export interface MyDriveProps {

}

const MyDrive:React.FC<MyDriveProps> = () => {
  const { ws } = useContext(WebSocketContext)
  const logModalRef = useRef<LogModalRef>(null)
  const editModalRef = useRef<EditModalRef>(null)

  const { form, dataSource, loading, pagination, reload, search, reset } = useTableRequest<DeviceServers>({
    onRequest: getDeviceServers,
  })

  const [submitting, setSubmitting] = useState(false)

  const send = useCallback((data: any) => {
    setSubmitting(true)
    return ws?.send(data).then(resp => {
      console.log(resp)
      if (resp.data.success) {
        message.success(resp.data.successMsg)
        reload()
      } else {
        message.error(resp.data.errorMsg)
      }
    }).finally(() => {
      setSubmitting(false)
    })
  }, [ws, reload])

  return (
    <>
      <NormalBreadcrumb></NormalBreadcrumb>
      <LogModal ref={logModalRef} />
      <EditModal ref={editModalRef} onSuccess={reload} />
      <Card className="m20" size="small">
        <Form layout="inline" form={form}>
          <Form.Item key="name" name="name">
            <Input placeholder="驱动名称"></Input>
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={search}>查询</Button>
          </Form.Item>
          <Form.Item>
            <Button type="default" onClick={reset}>重置</Button>
          </Form.Item>
        </Form>
      </Card>
      <Card className="m20">
        <Table
          dataSource={dataSource}
          rowKey="id"
          loading={loading || submitting}
          bordered
          size="small"
          pagination={pagination}
          columns={[
            {
              title: '驱动编号',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: '驱动名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '版本',
              dataIndex: 'version',
              key: 'version',
              render (value, record) {
                return record?.deviceLibrary?.version
              },
            },
            {
              title: '驱动类型',
              dataIndex: 'run_status',
              key: 'run_status',
              render (value, record) {
                return record?.deviceLibrary?.is_internal ? <Tag color="green">官方</Tag> : <Tag color="blue">自定义</Tag>
              },
            },
            {
              title: '关联平台',
              dataIndex: 'platform',
              key: 'platform',
            },
            {
              title: '状态',
              dataIndex: 'runStatus',
              key: 'runStatus',
              render (value) {
                const { status, text } = RunStatusMap[value]
                return <Badge status={status} text={text} />
              },
            },
            {
              title: '创建时间',
              dataIndex: 'created',
              key: 'created',
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '操作',
              dataIndex: 'action',
              key: 'action',
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Dropdown
                      trigger={['click']}
                      menu={{
                        items: [
                          { label: '启动', key: 'start' },
                          { label: '停止', key: 'stop' },
                          { label: '编辑', key: 'edit' },
                        ],
                        onClick ({ key }) {
                          if (['start', 'stop'].includes(key)) {
                            send({
                              code: 10002,
                              data: {
                                id: record.id,
                                run_status: {
                                  start: 1,
                                  stop: 2,
                                }[key],
                              },
                            })
                          }

                          if (key === 'edit') {
                            editModalRef.current?.open(record)
                          }
                        },
                      }}
                    >
                      <Typography.Link>
                        操作
                        <DownOutlined className="ml5" style={{ fontSize: 9 }} />
                      </Typography.Link>
                    </Dropdown>
                    <Typography.Link
                      onClick={() => {
                        logModalRef.current?.open(record.id)
                      }}
                    >日志</Typography.Link>
                    <Popconfirm
                      title="此操作将永久删除关联的产品以及设备, 是否继续?"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        send({
                          code: 10003,
                          data: {
                            id: record.id,
                          },
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
        ></Table>
      </Card>
    </>
  )
}

export default () => (
  <WebSocketProvider>
    <MyDrive></MyDrive>
  </WebSocketProvider>
)
