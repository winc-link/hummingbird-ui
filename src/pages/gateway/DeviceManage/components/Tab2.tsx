import dayjs, { Dayjs } from 'dayjs'
import React, { useEffect } from 'react'
import { Button, DatePicker, Form, Select, Table } from 'antd'
// import { ExclamationCircleOutlined } from '@ant-design/icons'
import { getDeviceEvent } from '@/api'
import { useParams, useSearchParams } from 'react-router-dom'
import { RangeValue } from './Tab1Modal'
import { DeviceEvent } from '@/api/device-thingmodel'
import { useTableRequest } from '@/hooks'

const { RangePicker } = DatePicker
const { useForm } = Form
// const { Text } = Typography

// const range = (start: number, end: number) => {
//   const result = []
//   for (let i = start; i < end; i++) {
//     result.push(i)
//   }
//   return result
// }

export interface FormValues {
  range: RangeValue<Dayjs>
  // eventType: DeviceEventRequestType['eventType']
  eventCode: string
}

export interface eventsEnum {
  id: string
  code: string
}
export interface DetailTab2Props {
  events: eventsEnum[]
}

export const DetailTab2: React.FC<DetailTab2Props> = ({ events }) => {
  const params = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const [form] = useForm()
  // const [loading, setLoading] = useState<boolean>(false)
  // const [dataSource, setDataSource] = useState<DeviceEvent[]>([])
  // const [dates, setDates] = useState<RangeValue<Dayjs>>()

  console.log('events', events)

  const { loading, dataSource, pagination, search } = useTableRequest<{ list: DeviceEvent[]}>({
    onRequest: (param) => {
      console.log('param', param)
      const [start, end] = form.getFieldValue('range') || []
      const eventCode = form.getFieldValue('eventCode')
      // const eventType = form.getFieldValue('eventType')
      return getDeviceEvent({
        ...param,
        id: params?.id || '',
        start: start?.valueOf()!,
        end: end?.valueOf()!,
        eventCode: eventCode || '',
        // eventType: eventType || '',
      })
    },
  })

  // const load = useCallback(() => {
  //   form.validateFields().then((values: FormValues) => {
  //     setLoading(true)
  //     getDeviceEvent({
  //       id: params?.id || '',
  //       start: dayjs((values.range || [])[0]).valueOf(),
  //       end: dayjs((values.range || [])[1]).valueOf(),
  //       eventCode: values.eventCode || '',
  //       eventType: values.eventType || '',
  //     }).then(resp => {
  //       if (resp.success) {
  //         setDataSource(resp.result.list || [])
  //       }
  //     }).finally(() => {
  //       setLoading(false)
  //     })
  //   })
  // }, [params, form])

  useEffect(() => {
    const code = searchParams.get('code')
    code && form.setFieldValue('eventCode', code)
    const start_at = Number(searchParams.get('start_at'))
    const end_at = Number(searchParams.get('end_at'))
    if (start_at && end_at) {
      form.setFieldValue('range', [dayjs(start_at), dayjs(end_at)])
    }
    // load()
    // search()
  }, [])

  return (
    <div>
      <Form
        layout="inline"
        form={form}
        initialValues={{
          range: [dayjs().add(-1, 'hours'), dayjs()],
          // eventType: '',
          eventCode: undefined,
        }}
      >
        {/* <Form.Item name="eventType">
          <Select
            style={{ width: 150 }}
            options={[
              { value: '', label: '事件类型 (全部)' },
              { value: 'info', label: '信息' },
              { value: 'alert', label: '告警' },
              { value: 'error', label: '故障' },
            ]}
          />
        </Form.Item> */}
        <Form.Item name="eventCode">
          <Select
            style={{ width: 150 }}
            placeholder="请选择标识符"
            options={events.map(({ code }) => ({ value: code, label: code }))}
          />
        </Form.Item>
        <Form.Item name="range">
          <RangePicker
            format="YYYY-MM-DD HH:mm:ss"
            placeholder={['开始日期', '结束日期']}
            // onCalendarChange={val => setDates(val)}
            onOpenChange={(open) => {
              if (open) {
                form.setFieldValue('range', [])
              } else {
                // setDates(undefined)
              }
            }}
            showTime={{
              hideDisabledOptions: true,
              defaultValue: [dayjs(dayjs().format('YYYY-MM-DD')), dayjs(dayjs().format('YYYY-MM-DD'))],
            }}
            // disabledDate={(current: Dayjs) => {
            //   if (!dates) return false
            //   const tooLate = dates[0] && current.diff(dates[0], 'days') > 1
            //   const tooEarly = dates[1] && dates[1].diff(current, 'days') > 0
            //   return !!tooEarly || !!tooLate
            // }}
            // disabledTime={(event, type) => {
            //   let hour = 0
            //   let minutes = 0
            //   let seconds = 0
            //   if (dates) {
            //     hour = dayjs(dates[0]).hour()
            //     minutes = dayjs(dates[0]).minute()
            //     seconds = dayjs(dates[0]).second()
            //   }

            //   if (type === 'start' || (dates && type === 'end' && dates[0]?.day() === dayjs(event).day())) {
            //     return {
            //       disabledHours: () => [],
            //       disabledMinutes: () => [],
            //       disabledSeconds: () => [],
            //     }
            //   }

            //   return {
            //     disabledHours: () => range(hour + 1, 24),
            //     disabledMinutes: () => range(minutes + 1, 60),
            //     disabledSeconds: () => range(seconds + 1, 60),
            //   }
            // }}
            presets={[
              { label: '最近1小时', value: [dayjs().add(-1, 'hours'), dayjs()] },
              { label: '最近3小时', value: [dayjs().add(-3, 'hours'), dayjs()] },
              { label: '最近24小时', value: [dayjs().add(-24, 'hours'), dayjs()] },
            ]}
            // renderExtraFooter={() => {
            //   return (
            //     <Text type="warning" style={{ fontSize: 12 }}>
            //       <ExclamationCircleOutlined className="ml20 mr10" />
            //       时间查询跨度应选择二十四小时之内，否则数据加载将消耗很长时间
            //     </Text>
            //   )
            // }}
          />
        </Form.Item>
        <Form.Item>
          <Button type="primary"
            onClick={() => {
              // load()
              search()
            }}
          >查询</Button>
          <Button className="ml10" onClick={() => {
            form.resetFields()
          }}>重置</Button>
        </Form.Item>
      </Form>
      <Table
        className="mt10"
        bordered
        size="small"
        rowKey="id"
        loading={loading}
        pagination={pagination}
        dataSource={dataSource?.map((i, id) => ({ id, ...i }))}
        columns={[
          {
            title: '时间',
            key: 'report_time',
            dataIndex: 'report_time',
            render (value) {
              return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            },
          },
          { title: '标识符', key: 'event_code', dataIndex: 'event_code' },
          { title: '事件名称', key: 'name', dataIndex: 'name' },
          { title: '事件类型', key: 'event_type', dataIndex: 'event_type' },
          {
            title: '输出参数',
            key: 'output_data',
            dataIndex: 'output_data',
            render (value) {
              return JSON.stringify(value)
            },
          },

        ]}
      ></Table>
    </div>
  )
}

export default DetailTab2
