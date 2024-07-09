import { Card, Col, Row, Typography } from 'antd'
import React from 'react'
import { RelatedDocs } from '../types'
import './RelatedDocs.less'

const { Title } = Typography

interface RelatedDocsProps {
  relatedDocs?: RelatedDocs
}

// eslint-disable-next-line no-empty-pattern
const RelatedDocsCard: React.FC<RelatedDocsProps> = ({
  relatedDocs,
}) => {
  return (<>
    <Card
      title={<Title level={3}>相关文档</Title>}
      extra={<a href={relatedDocs?.more} target="_blank" rel="noopener noreferrer">查看更多</a>}
    >
      <Row>
        {relatedDocs?.info?.map(({ name, jumpLink }) => (
          <Col span={12} key={name} className="relatedDocs-item" style={{ marginTop: '-10px' }}>
            <div onClick={() => {
              window.open(jumpLink)
            }}>
              {name}
            </div>
          </Col>
        ))}
      </Row>
    </Card>
  </>)
}

export default RelatedDocsCard
