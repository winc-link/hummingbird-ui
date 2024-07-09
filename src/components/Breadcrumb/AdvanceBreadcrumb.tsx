import React, { useMemo } from 'react'
import { Breadcrumb, Typography } from 'antd'
import { LeftOutlined } from '@ant-design/icons'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { breadcrumbNameMap } from '@/routes/menus'
import './style.less'

const { Title, Paragraph, Text } = Typography

export interface BreadcrumbItem {
  to: string
  label: string
}

export interface AdvanceBreadcrumbProps {
  title: React.ReactNode
  describe: React.ReactNode
  hasBack?: boolean
  background?: any
  breadcrumb?: BreadcrumbItem[]
}

const AdvanceBreadcrumb: React.FC<AdvanceBreadcrumbProps> = ({ title, describe, background, breadcrumb, hasBack = false }) => {
  const location = useLocation()
  const navigate = useNavigate()

  const backgroundImage = useMemo(() => {
    return `url(${background || require('@/assets/images/bg.ad187fed.png')})`
  }, [background])

  const defaultBreadcrumb = useMemo<BreadcrumbItem[]>(() => {
    const pathSnippets = location.pathname.split('/').filter(i => i)
    return pathSnippets.map((_, index) => {
      const to = `/${pathSnippets.slice(0, index + 1).join('/')}`
      return { to, label: breadcrumbNameMap[to] }
    }).filter(i => i.label)
  }, [location])

  return (
    <div className="advance-breadcrumb-title" style={{ backgroundImage }}>
      <Breadcrumb>
        <Breadcrumb.Item key="home">
          <Link to="/">首页</Link>
        </Breadcrumb.Item>
        {(breadcrumb?.length ? breadcrumb : defaultBreadcrumb).map(({ to, label }, index) => (
          <Breadcrumb.Item key={index}>
            <Text
              onClick={() => {
                if (to) {
                  navigate(to)
                }
              }}
            >{label}</Text>
          </Breadcrumb.Item>
        ))}
      </Breadcrumb>
      <div className="flex">
        {hasBack && (
          <div style={{ paddingTop: 22, paddingLeft: 10 }}>
            {/* <span className="square"></span> */}
            <LeftOutlined
              className="back-icon"
              onClick={() => {
                navigate(-1)
              }}
            />
          </div>
        )}
        <div style={{ flex: '1 1 auto' }}>
          <Title className="title" level={4}>{title}</Title>
          <Paragraph className="paragraph">{describe}</Paragraph>
        </div>
      </div>
    </div>
  )
}

export default AdvanceBreadcrumb
