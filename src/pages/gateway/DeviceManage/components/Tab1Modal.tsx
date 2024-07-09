import dayjs from 'dayjs'
import React, { forwardRef, useEffect, useImperativeHandle, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Button, DatePicker, Form, Modal, Table } from 'antd'
// import { ExclamationCircleOutlined } from '@ant-design/icons'
import { DeviceProperty, getHistoryProperty, HistoryProperty } from '@/api/device-thingmodel'
import { useTableRequest } from '@/hooks'

const { RangePicker } = DatePicker
const { useForm } = Form

// const range = (start: number, end: number) => {
//   const result = []
//   for (let i = start; i < end; i++) {
//     result.push(i)
//   }
//   return result
// }

export type EventValue<DateType> = DateType | null;
export type RangeValue<DateType> = [EventValue<DateType>, EventValue<DateType>] | null;

export interface Tab1ModalRef {
  open: (item: DeviceProperty) => void
}

export interface Tab1ModalProps {

}

export const Tab1Modal = forwardRef<Tab1ModalRef, Tab1ModalProps>((props, ref) => {
  const [searchParams] = useSearchParams()
  const params = useParams<{ id: string }>()
  const [form] = useForm()
  // const [dates, setDates] = useState<RangeValue<Dayjs>>()
  const [record, setRecord] = useState<DeviceProperty>()
  // const [dataSource, setDataSource] = useState<ReportDaum[]>([])
  // const [loading, setLoading] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const { loading, dataSource, pagination, search } = useTableRequest<HistoryProperty>({
    onRequest: (param) => {
      console.log('param', param)
      const [start, end] = form.getFieldValue('range') || []
      return getHistoryProperty(params.id!, {
        ...param,
        code: record?.code!,
        start: start?.valueOf()!,
        end: end?.valueOf()!,
      })
    },
  })

  useImperativeHandle(ref, () => {
    return {
      open (item) {
        setRecord(item)
        setIsModalOpen(true)
        search()
      },
    }
  }, [params])

  // const load = useCallback(() => {
  //   const [start, end] = form.getFieldValue('range') || []
  //   setLoading(true)
  //   getHistoryProperty(params.id!, {
  //     code: record?.code!,
  //     start: start?.valueOf()!,
  //     end: end?.valueOf()!,
  //   }).then(resp => {
  //     if (resp.success) {
  //       setDataSource(resp.result.list || [])
  //     }
  //   }).finally(() => {
  //     setLoading(false)
  //   })
  // }, [record?.code, form, params.id])

  // useEffect(() => {
  //   if (isModalOpen) {
  //     load()
  //   }
  // }, [isModalOpen])

  useEffect(() => {
    const start_at = Number(searchParams.get('start_at'))
    const end_at = Number(searchParams.get('end_at'))
    start_at && end_at && form.setFieldValue('range', [dayjs(start_at), dayjs(end_at)])
  }, [])

  return (
    <Modal
      title="功能历史数据"
      open={isModalOpen}
      footer={null}
      width={1000}
      onCancel={() => {
        setIsModalOpen(false)
      }}
    >
      <Form layout="inline" className="mb5">
        <Form.Item label="功能名称">{record?.name}</Form.Item>
        <Form.Item label="标识符">{record?.code}</Form.Item>
        <Form.Item label="数据类型">{record?.data_type}</Form.Item>
      </Form>
      <Form layout="inline" className="mb10" form={form}>
        <Form.Item name="range" initialValue={[dayjs().add(-1, 'hours'), dayjs()]}>
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
              search()
            }}
          >查询</Button>
          <Button className="ml10" onClick={() => {
            form.resetFields()
          }}>重置</Button>
        </Form.Item>
      </Form>

      <Table
        bordered
        size="small"
        scroll={{ y: 400 }}
        loading={loading}
        dataSource={dataSource}
        pagination={pagination}
        rowKey="time"
        columns={[
          {
            title: '时间',
            key: 'time',
            dataIndex: 'time',
            width: 500,
            render (value) {
              return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
            },
          },
          { title: '原始值', key: 'value', dataIndex: 'value' },
        ]}
      >

      </Table>
    </Modal>
  )
})

export default Tab1Modal
