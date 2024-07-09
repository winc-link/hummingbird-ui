import dayjs from 'dayjs'
import React, { useCallback, useState, useContext, useRef } from 'react'
import { Card, Dropdown, Popconfirm, Space, Table, Typography, Badge, Tag, message } from 'antd'
import { DownOutlined } from '@ant-design/icons'
import { NormalBreadcrumb } from '@/components/Breadcrumb'
import { WebSocketProvider, WebSocketContext } from '@/components/WebSocket'
import { cloudInstance } from '@/api'
import { useTableRequest } from '@/hooks'
import { LogModal, LogModalRef } from './LogModal'
import { AuthorizationModal, AuthorizationModalRef } from './AuthorizationModal'
import { RunStatusMap } from '@/utils/statusMap'
import { CloudInstance } from '@/api/cloud-instance'

const { Text } = Typography

export interface MyServiceProps {

}

const MyService: React.FC<MyServiceProps> = () => {
  const { ws } = useContext(WebSocketContext)
  const logModalRef = useRef<LogModalRef>(null)
  const authorizationModalRef = useRef<AuthorizationModalRef>(null)

  const { dataSource, loading, pagination, reload } = useTableRequest<CloudInstance>({
    onRequest: cloudInstance,
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
      <AuthorizationModal ref={authorizationModalRef} onFinish={reload} />
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
              title: '插件编号',
              dataIndex: 'id',
              key: 'id',
            },
            {
              title: '插件名称',
              dataIndex: 'name',
              key: 'name',
            },
            {
              title: '插件类型',
              dataIndex: 'is_internal',
              key: 'is_internal',
              render (value, record) {
                return record.is_internal ? <Tag color="success">官方</Tag> : <Tag color="processing">自定义</Tag>
              },
            },
            {
              title: '状态',
              dataIndex: 'run_status',
              key: 'run_status',
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
                          { label: '授权', key: 'authorization' },
                        ],
                        onClick ({ key }) {
                          if (['start', 'stop'].includes(key)) {
                            send({
                              code: 20002,
                              data: {
                                id: record.id,
                                run_status: {
                                  start: 1,
                                  stop: 2,
                                }[key],
                              },
                            })
                          }

                          if (key === 'authorization') {
                            const template = JSON.parse(record?.extend_template)
                            if (Array.isArray(template) && template.length) {
                              authorizationModalRef.current?.open(record)
                            } else {
                              message.warning('暂无授权配置')
                            }
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
                          code: 20003,
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
    <MyService></MyService>
  </WebSocketProvider>
)
