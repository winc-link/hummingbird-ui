import React from 'react'
import { Button, Card, Col, Row } from 'antd'
import { languageSdk } from '@/api'

import './style.less'
import useRequest from '@/hooks/useRequest'

// const { useMessage } = message

export interface DocumentsProps {

}

const Documents: React.FC<DocumentsProps> = () => {
  const languageSdkApi = useRequest(languageSdk, {
    // manual: true,
    formatData: (data) => data,
  })

  return (
    <>
      <div className="my-service p20">
        <Card bordered>
          <div className="mb20" style={{ fontSize: '14px', fontWeight: '600' }}>产品文档</div>
          <Row>
            <Col span={8}>
              <Card
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  window.open(languageSdkApi.data?.doc?.addr)
                }}>
                <div style={{ float: 'left' }} className="mr20">
                  <img style={{ width: '40px', height: '40px' }} src={languageSdkApi.data?.doc?.icon} alt="" />
                </div>
                <div className="mt10">{languageSdkApi.data?.doc?.name}</div>
              </Card>
            </Col>
          </Row>
          <div className="mb20 mt20" style={{ fontSize: '14px', fontWeight: '600' }}>设备接入SDK</div>
          <Row gutter={15}>
            {languageSdkApi.data?.sdk_language?.map((item: any) => {
              return (
                <Col span={8} key={item.name}>
                  <Card>
                    <div style={{ float: 'left' }} className="mr20">
                      <img style={{ width: '40px', height: '40px' }} src={item.icon} alt="" />
                    </div>
                    <div style={{ float: 'left' }}>
                      <div>{item.name}</div>
                      <div>{item.description}</div>
                      <Button
                        type="primary"
                        className="mt20"
                        onClick={() => {
                          window.open(item.addr)
                        }}
                      >
                        查看工具包
                      </Button>
                    </div>
                  </Card>
                </Col>
              )
            })}
          </Row>
        </Card>
      </div>
    </>
  )
}

export default Documents
