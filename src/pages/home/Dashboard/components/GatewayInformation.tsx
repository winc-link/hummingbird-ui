import { Card, Col, Row, Typography } from 'antd'
import React from 'react'
import { GatewayInfo } from '../types'
import './GatewayInformation.less'
import c from 'classnames'

const { Title } = Typography

interface GatewayInformationProps {
  gatewayInfo?: GatewayInfo
  className?: string
}

// eslint-disable-next-line no-empty-pattern
const GatewayInformation: React.FC<GatewayInformationProps> = ({
  gatewayInfo,
  className,
}) => {
  return (<>
    <Card
      title={<Title level={3}>平台信息</Title>}
      className={c('GatewayInformation', className)}
      style={{ minHeight: '230px' }}
    >
      <Row className="GatewayInformation-item" gutter={[0, 10]}>
        <Col span={12}>激活状态：</Col>
        <Col span={12}>{{
          true: <span style={{ color: '#52c41a' }}>已激活</span>,
          false: <span style={{ color: '#db8d34' }}>未激活</span>,
        }[String(gatewayInfo?.gatewayStatus)]}</Col>
        <Col span={12}>编号：</Col>
        <Col span={12}>{gatewayInfo?.gatewayId || '-'}</Col>
        <Col span={12}>激活时间：</Col>
        <Col span={12}>{gatewayInfo?.activeTime || '-'}</Col>
        <Col span={12}>版本信息：</Col>
        <Col span={12}>{gatewayInfo?.versionNumber || '-'}</Col>
        {/* <Col span={12}>管理设备数：</Col>
        <Col span={12}>{gatewayInfo?.deviceCount}/{gatewayInfo?.maxDevice}(最大)</Col> */}
      </Row>
    </Card>
  </>)
}

export default GatewayInformation
