import dayjs from 'dayjs'
import React, { useRef } from 'react'
import { Button, Card, Popconfirm, Space, Table, Typography, message } from 'antd'
import { PlusOutlined, CloseCircleFilled, CheckCircleFilled } from '@ant-design/icons'
import { DataResource, deleteResource, getDataResource, testResource } from '@/api'
import { useTableRequest } from '@/hooks'
import { AddKafkaModal, AddKafkaModalRef } from './components/AddKafkaModal'

const { Text } = Typography
const { useMessage } = message

export interface KafkaProps {

}

const Kafka: React.FC<KafkaProps> = () => {
  const [messageApi, contextHolder] = useMessage()
  const AddKafkaModalRef = useRef<AddKafkaModalRef>(null)

  const { loading, dataSource, pagination, reload } = useTableRequest<DataResource>({
    onRequest: (params) => getDataResource({ ...params, type: '消息队列Kafka' }),
  })

  return (
    <>
      {contextHolder}
      <AddKafkaModal ref={AddKafkaModalRef} onFinish={reload}></AddKafkaModal>
      <Card className="m20" size="small">
        <Space className="mb15 justify-space-between">
          <Button
            type="primary"
            onClick={() => {
              AddKafkaModalRef.current?.open()
            }}
          ><PlusOutlined />添加实例</Button>
        </Space>
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '实例名称', key: 'name', dataIndex: 'name' },
            {
              title: '创建时间',
              key: 'created',
              dataIndex: 'created',
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '验证状态',
              key: 'health',
              dataIndex: 'health',
              render: (value) => {
                if (value === false) return <Space><CloseCircleFilled style={{ color: '#ef8e62' }} />验证失败</Space>
                if (value === true) return <Space><CheckCircleFilled style={{ color: '#52c41a' }} />验证成功</Space>
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
                    <Typography.Link
                      onClick={() => {
                        testResource(record?.id)
                          .then(resp => {
                            if (resp.success) {
                              messageApi.open({ type: 'success', content: '操作成功' })
                              reload()
                            } else {
                              messageApi.open({ type: 'error', content: resp.errorMsg })
                            }
                          })
                      }}
                    >验证</Typography.Link>
                    <Typography.Link
                      onClick={() => {
                        AddKafkaModalRef.current?.open(record)
                      }}
                    >修改</Typography.Link>
                    <Popconfirm
                      title="您确定要删除该实例吗？"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteResource(record?.id)
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

export default Kafka
