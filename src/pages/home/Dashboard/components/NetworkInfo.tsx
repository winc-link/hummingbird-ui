import { Card, Col, Row, Select, Typography } from 'antd'
import React, { useState } from 'react'
import { NetWorkInfo } from '../types'
import './GatewayInformation.less'
import c from 'classnames'

const { Title } = Typography

interface NetworkInfoProps {
  netWorkInfo?: NetWorkInfo
  className?: string
}

// eslint-disable-next-line no-empty-pattern
const NetworkInfo: React.FC<NetworkInfoProps> = ({
  netWorkInfo,
  className,
}) => {
  const [index, setIndex] = useState<number>(0)
  return (<>
    <Card
      title={<Title level={3}>网络信息</Title>}
      style={{ minHeight: '230px' }}
      extra={
        <Select
          defaultValue={index}
          style={{ width: 90 }}
          size="small"
          options={netWorkInfo?.newWork.map(({ ncId }, index) => ({ value: index, label: ncId }))}
          onChange={(index) => setIndex(index)}
        />
      }
      className={c('GatewayInformation', className)}
    >
      <Row className="GatewayInformation-item" gutter={[0, 10]}>
        <Col span={12}>联网状态：</Col>
        <Col span={12}>{{
          true: <span style={{ color: '#52c41a' }}>已联网</span>,
          false: <span style={{ color: '#db8d34' }}>未联网</span>,
        }[String(netWorkInfo?.newWork[index].netlink)]}</Col>
        <Col span={12}>IP地址：</Col>
        <Col span={12}>{netWorkInfo?.newWork[index].localIp || '-'}</Col>
        <Col span={12}>网关地址：</Col>
        <Col span={12}>{netWorkInfo?.newWork[index].gwIp || '-'}</Col>
        <Col span={12}>子网掩码：</Col>
        <Col span={12}>{netWorkInfo?.newWork[index].smIp || '-'}</Col>
        <Col span={12}>dns：</Col>
        <Col span={12}>{netWorkInfo?.dns || '-'}</Col>
      </Row>
    </Card>
  </>)
}

export default NetworkInfo
