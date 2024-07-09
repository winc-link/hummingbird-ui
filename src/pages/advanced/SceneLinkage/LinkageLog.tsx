import dayjs from 'dayjs'
import React from 'react'
import { Table, Card, Form, Button, DatePicker } from 'antd'
// import { PlusOutlined } from '@ant-design/icons'
import { logScene, Scene } from '@/api'
import { useTableRequest } from '@/hooks'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import 'dayjs/locale/zh-cn'
import { useParams } from 'react-router-dom'

const { RangePicker } = DatePicker
export interface LinkageLogProps {

}

const LinkageLog: React.FC<LinkageLogProps> = () => {
  // const navigate = useNavigate()
  const param = useParams()

  // 获取表格数据接口
  const { loading, dataSource, pagination, form, search, reset } = useTableRequest<Scene>({
    // onRequest: (params) => logScene(params, param?.id as string),
    onRequest: (params) => {
      return logScene(
        {
          ...params,
          start_time: params.time?.[0].valueOf(),
          end_time: params.time?.[1].valueOf(),
          time: undefined,
        },
        param?.id as string,
      )
    },
  })

  return (
    <>
      <AdvanceBreadcrumb
        hasBack
        title="联动日志"
        describe="平台提供场景日志功能，可以通过场景联动日志查看场景触发时间、服务调用结果。"
        breadcrumb={[
          { label: '场景联动', to: '/advanced/scene/linkage' },
          { label: '联动日志', to: '' },
        ]}
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card className="m20" size="small">
        <Form
          layout="inline"
          form={form}
        >
          <Form.Item key="time" name="time" label="">
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
      </Card>
      <Card className="m20" size="small">
        <Table
          loading={loading}
          dataSource={dataSource}
          pagination={pagination}
          bordered
          rowKey="id"
          size="small"
          columns={[
            { title: '联动规则名称', key: 'name', dataIndex: 'name' },
            { title: '执行结果', key: 'exec_res', dataIndex: 'exec_res' },
            {
              title: '触发时间',
              key: 'created',
              dataIndex: 'created',
              render (value) {
                return dayjs(value).format('YYYY-MM-DD HH:mm:ss')
              },
            },
          ]}
        />
      </Card>
    </>
  )
}

export default LinkageLog
