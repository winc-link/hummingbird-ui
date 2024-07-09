/* eslint-disable multiline-ternary */
import dayjs from 'dayjs'
import React, { useRef } from 'react'
import { Button, Card, Popconfirm, Space, Table, Typography, message, Form, Input, Tooltip } from 'antd'
import { PlusOutlined, MinusCircleFilled, CheckCircleFilled, ArrowsAltOutlined } from '@ant-design/icons'
import { getAlertRule, deleteRule, AlertRule, stopRule, startRule } from '@/api'
import { useTableRequest } from '@/hooks'
// import { RuleStatusMap } from '@/utils/statusMap'
import { AddRuleModal, AddRuleModalRef } from './components/AddRuleModal'
import { useNavigate } from 'react-router-dom'
// import { map } from 'lodash'

const { Text } = Typography
const { useMessage } = message
const { Search } = Input

export interface AlarmRulesProps {

}

const AlarmRules: React.FC<AlarmRulesProps> = () => {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = useMessage()
  // const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const addRuleModalRef = useRef<AddRuleModalRef>(null)

  const { loading, dataSource, pagination, form, reload, search } = useTableRequest<AlertRule>({
    onRequest: (params) => getAlertRule({ ...params }),
  })

  return (
    <>
      {contextHolder}
      <AddRuleModal ref={addRuleModalRef} onFinish={reload}></AddRuleModal>
      <Form layout="inline" className="ml20" form={form}>
        <Form.Item key="name" name="name">
          <Search placeholder="请输入告警规则名称" allowClear onSearch={search} />
        </Form.Item>
      </Form>
      <Card className="m20" size="small">
        <Space className="mb15 justify-space-between">
          <Button
            type="primary"
            onClick={() => {
              addRuleModalRef.current?.open()
            }}
          ><PlusOutlined />添加规则</Button>
        </Space>
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '告警规则名称', key: 'name', dataIndex: 'name', width: '10em' },
            {
              title: '告警规则描述',
              key: 'description',
              dataIndex: 'description',
              width: 200,
              ellipsis: true,
              render (value) {
                return value
                  ? <>
                    <Tooltip placement="bottom" title={value}>
                      <Space><ArrowsAltOutlined style={{ color: '#1890ff' }}/> </Space>
                    </Tooltip>
                    {value}
                  </>
                  : '-'
              },
            },
            { title: '告警类型', key: 'alert_type', dataIndex: 'alert_type', width: '6em' },
            { title: '告警级别', key: 'alert_level', dataIndex: 'alert_level', width: '6em' },
            {
              title: '创建时间',
              key: 'created',
              dataIndex: 'created',
              width: 130,
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '状态',
              key: 'status',
              dataIndex: 'status',
              width: '6em',
              render: (value) => {
                if (value === 'stopped') return <Space><MinusCircleFilled style={{ color: '#87909d' }} />禁用</Space>
                if (value === 'running') return <Space><CheckCircleFilled style={{ color: '#55af70' }} />启用</Space>
                return '-'
              },
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              width: 130,
              render (value, record) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    {record.status === 'running' ? (
                      <Popconfirm
                        title="您确定要禁用此告警规则吗？"
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                        onConfirm={() => {
                          stopRule(record?.id)
                            .then(resp => {
                              if (resp.success) {
                                messageApi.open({ type: 'success', content: '禁用成功' })
                                reload()
                              } else {
                                messageApi.open({ type: 'error', content: resp.errorMsg })
                              }
                            })
                        }}
                      >
                        <Typography.Link>禁用</Typography.Link>
                      </Popconfirm>
                    ) : (
                      <Popconfirm
                        title="您确定要启用此告警规则吗？"
                        okText="确定"
                        cancelText="取消"
                        placement="topRight"
                        onConfirm={() => {
                          startRule(record?.id)
                            .then(resp => {
                              if (resp.success) {
                                messageApi.open({ type: 'success', content: '启用成功' })
                                reload()
                              } else {
                                messageApi.open({ type: 'error', content: resp.errorMsg })
                              }
                            })
                        }}
                      >
                        <Typography.Link>启用</Typography.Link>
                      </Popconfirm>
                    )}
                    <Typography.Link
                      onClick={() => {
                        navigate(`/monitor/alarmCenter/detail/${record?.id}`)
                      }}
                    >规则详情</Typography.Link>
                    <Popconfirm
                      title="您确定要删除此告警规则吗？"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        deleteRule(record?.id)
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

export default AlarmRules
