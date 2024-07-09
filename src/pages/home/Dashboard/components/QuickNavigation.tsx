import { Card, Col, Row, Typography } from 'antd'
import { useNavigate } from 'react-router-dom'
import React from 'react'
import { QuickNavigation } from '../types'
import './QuickNavigation.less'

const { Title } = Typography

interface QuickNavigationProps {
  quickNavigationList?: QuickNavigation[]
}

// eslint-disable-next-line no-empty-pattern
const QuickNavigationCard: React.FC<QuickNavigationProps> = ({
  quickNavigationList,
}) => {
  const redirect = useNavigate()
  return (<>
    <Card
      title={<Title level={3}>快捷入口</Title>}>
      <Row style={{ marginTop: '-10px' }}>
        {quickNavigationList?.map(({ name, icon }) => (
          <Col span={8} key={name} className="quickNavigation-item"
            onClick={() => {
              if (name === '添加产品') {
                redirect('/gateway/product/manage?create')
              } if (name === '添加设备') {
                redirect('/gateway/device/manage?create')
              } if (name === '云插件') {
                redirect('/cloud/service')
              } if (name === '服务监控') {
                redirect('/monitor/systemMonitor')
              } if (name === '规则引擎') {
                redirect('/advanced/rule/engine')
              }
            }}
          >
            <div className="quickNavigation-item__iconBack">
              <img src={icon} alt="" className="quickNavigation-item__icon" />
            </div>
            <div className="quickNavigation-item__name">{name}</div>
          </Col>
        ))}
      </Row>
    </Card>
  </>)
}

export default QuickNavigationCard
