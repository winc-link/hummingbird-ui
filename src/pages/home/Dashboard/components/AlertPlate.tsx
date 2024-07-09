import { Card, Typography } from 'antd'
import React, { useCallback } from 'react'
import { Pie } from '@ant-design/plots'
import { AlertPlate } from '../types'

const { Title } = Typography

interface AlertPlateProps {
  alertPlateList: AlertPlate[]
}

const colorMap = {
  紧急: '#f2a276',
  重要: '#2a7ae7',
  次要: '#6aa2f8',
  提示: '#92befa',
}

const config = {
  appendPadding: 10,
  angleField: 'count',
  colorField: 'alert_level',
  radius: 0.55,
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

// eslint-disable-next-line no-empty-pattern
const AlertPlateCard: React.FC<AlertPlateProps> = ({
  alertPlateList,
}) => {
  const selectColor = useCallback((d:any) => colorMap[d.alert_level as keyof typeof colorMap], [])
  return (<>
    <Card
      title={<Title level={3}>告警相关</Title>}
    >
      <Pie
        data={alertPlateList}
        height={ 250 }
        style={{ margin: '-20px', marginTop: '-60px' }}
        color={selectColor}
        legend={false}
        statistic={{
          title: false,
          content: {
            content: '',
          },
        }}
        label={{
          type: 'spider',
          labelHeight: 28,
          content: (data: any) => `${data.alert_level}\n${data.count}`,
        }}
        {...config}
      />
      <div style={{ fontSize: 14, color: '#aaa', textAlign: 'center', marginTop: '-40px' }}>
        数据统计截止昨日24时
      </div>
    </Card>
  </>)
}

export default AlertPlateCard
