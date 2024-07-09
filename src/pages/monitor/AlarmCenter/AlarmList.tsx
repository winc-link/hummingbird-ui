import dayjs from 'dayjs'
import React, { useCallback, useState } from 'react'
import { Button, Card, Popconfirm, Space, Table, Typography, message, Form, Input, Row, Col, Select, Badge, Modal, DatePicker, Tooltip } from 'antd'
import { getAlertPlate, getAlarmList, AlertList, alertIgnore, alertTreated } from '@/api'
import { useTableRequest } from '@/hooks'
import { Pie } from '@ant-design/plots'
import { AlertPlate } from './types'
import { ArrowsAltOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'

const { Text } = Typography
const { useMessage } = message
const { TextArea } = Input
const { RangePicker } = DatePicker

interface AlarmListProps {

}

const config = {
  appendPadding: 10,
  angleField: 'count',
  colorField: 'alert_level',
  radius: 0.75,
  innerRadius: 0.6,
  interactions: [
    {
      type: 'element-selected',
    },
    {
      type: 'element-active',
    },
  ],
}

const colorMap = {
  紧急: '#f2a276',
  重要: '#2a7ae7',
  次要: '#6aa2f8',
  提示: '#92befa',
}

// eslint-disable-next-line no-empty-pattern
const AlarmList: React.FC<AlarmListProps> = ({
}) => {
  const navigate = useNavigate()
  const [messageApi, contextHolder] = useMessage()
  const [data, setData] = useState<AlertPlate[]>()
  const [alertLevel, setAlertLevel] = useState({
    prompt: 0,
    promptPercent: '0%',
    secondary: 0,
    secondaryPercent: '0%',
    important: 0,
    importantPercent: '0%',
    urgent: 0,
    urgentPercent: '0%',
    total: 0,
  })

  // 获取饼图数据接口
  const loadAlertPlate = useCallback(() => {
    getAlertPlate<AlertPlate[]>()
      .then((resp) => {
        if (resp.success) {
          setData(resp.result)
          const alertLevel = {
            prompt: 0,
            promptPercent: '0%',
            secondary: 0,
            secondaryPercent: '0%',
            important: 0,
            importantPercent: '0%',
            urgent: 0,
            urgentPercent: '0%',
            total: 0,
          }
          let total = 0
          for (let index = 0; index < resp.result.length; index++) {
            const { count } = resp.result[index]
            total += count
          }
          for (let index = 0; index < resp.result.length; index++) {
            const { alert_level, count } = resp.result[index]
            if (alert_level === '提示') {
              alertLevel.prompt = count
              alertLevel.promptPercent = `${(total === 0 ? 0 : (count / total * 100)).toFixed(2)}%`
            }
            if (alert_level === '次要') {
              alertLevel.secondary = count
              alertLevel.secondaryPercent = `${(total === 0 ? 0 : (count / total * 100)).toFixed(2)}%`
            }
            if (alert_level === '紧急') {
              alertLevel.urgent = count
              alertLevel.urgentPercent = `${(total === 0 ? 0 : (count / total * 100)).toFixed(2)}%`
            }
            if (alert_level === '重要') {
              alertLevel.important = count
              alertLevel.importantPercent = `${(total === 0 ? 0 : (count / total * 100)).toFixed(2)}%`
            }
          }
          alertLevel.total = total
          setAlertLevel(alertLevel)
        }
      }).catch((err: any) => {
        console.log(err)
      })
  }, [])

  // useEffect(() => {
  //   loadAlertPlate()
  // }, [])

  // 获取表格数据接口
  const { loading, dataSource, pagination, form, reload, search, reset } = useTableRequest<AlertList>({
    onRequest: (params) => {
      loadAlertPlate()
      return getAlarmList({
        ...params,
        trigger_start_time: params.trigger_time?.[0].valueOf(),
        trigger_end_time: params.trigger_time?.[1].valueOf(),
        trigger_time: undefined,
      })
    },
  })

  interface DataType {
    id: any,
    status: string
  }
  const [open, setOpen] = useState(false)
  const [currentRecord, setCurrentRecord] = useState<DataType | null>(null)

  const showModal = (record: DataType) => {
    setCurrentRecord(record)
    setOpen(true)
  }

  const handleOk = async () => {
    // 处理逻辑
    const text = await form.validateFields()
    const { message } = text
    const vaules = {
      id: currentRecord?.id,
      message,
    }
    alertTreated(vaules)
      .then(resp => {
        if (resp.success) {
          messageApi.open({ type: 'success', content: '处理成功' })
          setOpen(false)
          reload()
        } else {
          messageApi.open({ type: 'error', content: resp.errorMsg })
        }
      })
  }

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
  }

  const selectColor = useCallback((d:any) => colorMap[d.alert_level as keyof typeof colorMap], [])

  return (
    <>
      <Row className="mt20">
        <Col flex="0 1 336px">
          <Pie
            data={(data || []) as Record<string, any>[]}
            height={180}
            style={{ marginTop: '-20px' }}
            legend={false}
            statistic={{
              title: false,
              content: {
                content: '',
              },
            }}
            label={false}
            color={selectColor}
            {...config}
          />
        </Col>
        <Col flex="0 1 370px">
          <div style={{ marginLeft: '60px' }}>
            <div style={{ color: '#aaa' }}>告警数（7日）</div>
            <div style={{ fontSize: '20px', fontWeight: 600 }} className="mt15">{alertLevel.total}</div>
            <Row className="mt15">
              <Col span={6}>
                <div style={{ color: colorMap['紧急'] }}>紧急 {alertLevel.urgentPercent}</div>
                <div style={{ fontSize: '20px' }} className="mt10">{alertLevel.urgent}</div>
              </Col>
              <Col span={6}>
                <div style={{ color: colorMap['重要'] }}>重要 {alertLevel.importantPercent}</div>
                <div style={{ fontSize: '20px' }} className="mt10">{alertLevel.important}</div>
              </Col>
              <Col span={6}>
                <div style={{ color: colorMap['次要'] }}>次要 {alertLevel.secondaryPercent}</div>
                <div style={{ fontSize: '20px' }} className="mt10">{alertLevel.secondary}</div>
              </Col>
              <Col span={6}>
                <div style={{ color: colorMap['提示'] }}>提示 {alertLevel.promptPercent}</div>
                <div style={{ fontSize: '20px' }} className="mt10">{alertLevel.prompt}</div>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
      {contextHolder}
      <Form layout="inline" className="ml20 mt20" form={form}>
        <Form.Item key="alert_level" name="alert_level">
          <Select
            placeholder="告警级别"
            style={{ width: 90 }}
            allowClear
            options={[
              { value: '', label: '全部' },
              { value: '紧急', label: '紧急' },
              { value: '重要', label: '重要' },
              { value: '次要', label: '次要' },
              { value: '提示', label: '提示' },
            ]}
          />
        </Form.Item>
        <Form.Item key="status" name="status">
          <Select
            placeholder="告警状态"
            style={{ width: 90 }}
            allowClear
            options={[
              { value: '', label: '全部' },
              { value: '未处理', label: '未处理' },
              { value: '已处理', label: '已处理' },
              { value: '忽略', label: '忽略' },
            ]}
          />
        </Form.Item>
        <Form.Item key="name" name="name">
          <Input style={{ width: 220 }} addonBefore="告警规则名称" allowClear placeholder="请输入搜索内容"></Input>
        </Form.Item>
        <Form.Item key="trigger_time" name="trigger_time" label="触发时间">
          <RangePicker
            style={{ width: 300 }}
            showTime={{ format: 'HH:mm:ss' }}
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始时间', '结束时间']}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary" onClick={search}>查询</Button>
        </Form.Item>
        <Form.Item>
          <Button type="default" onClick={reset}>重置</Button>
        </Form.Item>
      </Form>
      <Card className="m20" size="small">
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '告警ID', key: 'id', dataIndex: 'id', width: '6em' },
            { title: '告警规则名称', key: 'name', dataIndex: 'name', width: '8em' },
            // {
            //   title: '触发告警数据',
            //   key: 'alert_result',
            //   dataIndex: 'alert_result',
            //   ellipsis: true,
            //   width: 130,
            //   render (value) {
            //     return value
            //       ? <>
            //         <Tooltip placement="bottom" title={value}>
            //           <Space><ArrowsAltOutlined style={{ color: '#1890ff' }} /> </Space>
            //         </Tooltip>
            //         {value}
            //       </>
            //       : '-'
            //   },
            // },
            { title: '告警等级', key: 'alert_level', dataIndex: 'alert_level', width: 70 },
            {
              title: '触发时间',
              key: 'trigger_time',
              dataIndex: 'trigger_time',
              width: 80,
              render (value) {
                return value === 0 ? '-' : dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '处理时间',
              key: 'treated_time',
              dataIndex: 'treated_time',
              width: 80,
              render (value) {
                return value === 0 ? '-' : dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
            {
              title: '告警状态',
              key: 'status',
              dataIndex: 'status',
              width: '6em',
              render (value, record) {
                return (
                  <>
                    {value && <Badge color={{
                      已处理: 'green',
                      忽略: 'gray',
                      未处理: 'orange',
                    }[record.status] || 'gray'} />}
                    <Text className="ml5">{value || '-'}</Text>
                  </>
                )
              },
            },
            {
              title: '处理结果',
              key: 'message',
              dataIndex: 'message',
              ellipsis: true,
              width: 130,
              render (value) {
                return value
                  ? <>
                    <Tooltip placement="bottom" title={value}>
                      <Space><ArrowsAltOutlined style={{ color: '#1890ff' }} /> </Space>
                    </Tooltip>
                    {value}
                  </>
                  : '-'
              },
            },
            {
              title: '操作',
              key: 'action',
              dataIndex: 'action',
              width: '8em',
              render (text: string, record: DataType) {
                return (
                  <Space split={<Text type="secondary">/</Text>}>
                    <Typography.Link
                      disabled={record.status === '已处理'}
                      onClick={() => showModal(record)}
                    >处理</Typography.Link>
                    <Popconfirm
                      title="此操作将忽略该条记录, 是否继续?"
                      okText="确定"
                      cancelText="取消"
                      placement="topRight"
                      onConfirm={() => {
                        alertIgnore(record?.id)
                          .then(resp => {
                            if (resp.success) {
                              messageApi.open({ type: 'success', content: '操作成功' })
                              reload()
                              console.log('操作成功')
                            } else {
                              messageApi.open({ type: 'error', content: resp.errorMsg })
                            }
                          })
                      }}
                    >
                      <Typography.Link disabled={record.status === '忽略'}>忽略</Typography.Link>
                    </Popconfirm>
                    <Typography.Link
                      onClick={() => {
                        const { code, device_id, trigger, end_at, start_at } = JSON.parse((record as any).alert_result)
                        navigate(`/gateway/device/detail/${encodeURIComponent(device_id)}?code=${encodeURIComponent(code)}&trigger=${encodeURIComponent(trigger)}&end_at=${encodeURIComponent(end_at)}&start_at=${encodeURIComponent(start_at)}`)
                      }}
                    >数据定位</Typography.Link>
                  </Space>
                )
              },
            },
          ]}
        />
      </Card>
      <Modal
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        maskClosable={false}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="处理意见"
            name="message"
            rules={[{ required: true, message: '请输入处理意见' }]}
          >
            <TextArea
              placeholder="请输入处理意见"
              rows={4}>
            </TextArea>
          </Form.Item>
        </Form>
      </Modal>
    </>
  )
}

export default AlarmList
