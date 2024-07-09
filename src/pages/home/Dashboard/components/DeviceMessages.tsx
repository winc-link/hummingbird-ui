import { Card, Typography } from 'antd'
import React from 'react'
import { Area } from '@ant-design/plots'
import { MsgGather } from '../types'

const { Title } = Typography

interface DeviceMessagesProps {
  msgGatherList: MsgGather[]
}

const config = {
  xField: 'date',
  yField: 'count',
  smooth: true,
  label: {
    offsetY: -6,
    style: {
      fill: 'rgb(3, 104, 219)',
    },
  },
  point: {
    size: 3,
    shape: 'circle',
    style: {
      fill: 'white',
      stroke: '#5B8FF9',
      lineWidth: 2,
    },
  },
}

const DeviceMessages: React.FC<DeviceMessagesProps> = ({
  msgGatherList,
}) => {
  return (<>
    <Card
      title={<Title level={3}>设备消息总数</Title>}
      extra="每日凌晨更新"
    >
      <Area
        data={msgGatherList}
        height={200}
        tooltip={{
          formatter: (datum) => {
            return { name: '数据', value: datum.count }
          },
        }}
        {...config}
        style={{ marginTop: '-10px' }}
      />
    </Card>
  </>)
}

export default DeviceMessages
