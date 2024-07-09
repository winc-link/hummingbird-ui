import { Card, Typography } from 'antd'
import React from 'react'
import { PageInfo } from '../types'
import './Overview.less'

const { Text, Title } = Typography

interface OverviewProps {
  pageInfo?: PageInfo
}

const Overview: React.FC<OverviewProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  pageInfo,
}) => {
  return (<>
    <Card
      title={<Title level={3}>平台概述</Title>}
      className="overview"
    >
      <Card.Grid
        style={gridStyle}
        hoverable={false}
      >
        <OverviewItem
          title="产品数"
          count={pageInfo?.product.total}
          infoList={[
            { title: '本地产品', value: `${pageInfo?.product.self}个` },
            { title: '第三方产品', value: `${pageInfo?.product.other}个` },
          ]}
        />
      </Card.Grid>
      <Card.Grid
        style={gridStyle}
        hoverable={false}
      >
        <OverviewItem
          title="设备数"
          count={pageInfo?.device.total}
          infoList={[
            { title: '本地设备', value: `${pageInfo?.device.self}个` },
            { title: '第三方设备', value: `${pageInfo?.device.other}个` },
          ]}
        />
      </Card.Grid>
      <Card.Grid
        style={gridStyle}
        hoverable={false}
      >
        <OverviewItem
          title="云插件"
          count={pageInfo?.cloudInstance.count}
          infoList={[
            { title: '运行中', value: `${pageInfo?.cloudInstance.run_count}个` },
            { title: '已停止', value: `${pageInfo?.cloudInstance.stop_count}个` },
          ]}
        />
      </Card.Grid>
      <Card.Grid
        style={gridStyle}
        hoverable={false}
      >
        <OverviewItem
          title="告警数"
          count={pageInfo?.alert.total}
          infoList={[
            { title: '数据统计截止昨日24时', value: ' ' },
          ]}
        />
      </Card.Grid>
    </Card>
  </>)
}

interface OverviewItemProps {
  title?: string
  count?: number
  infoList?: { title: string, value?: string }[]
}

const gridStyle: React.CSSProperties = {
  width: '25%',
}
const OverviewItem: React.FC<OverviewItemProps> = (props) => {
  return (
    <div className="overview-item flex flex-vertical justify-space-between" style={{ marginTop: '-20px' }}>
      <div>
        <div className="overview-item__title">{props.title}</div>
        <div className="overview-item__count">{props.count}</div>
      </div>
      <div>
        {(props.infoList || []).map(({ title, value }) => (
          <Text
            className="overview-item__info flex flex-horizontal justify-space-between"
            key={title}
          >
            <span>{title}</span>
            <span>{value}</span>
          </Text>
        ))}
      </div>
    </div>
  )
}

export default Overview
