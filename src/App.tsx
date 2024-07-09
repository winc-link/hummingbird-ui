import React, { useEffect } from 'react'
import { ConfigProvider, Spin } from 'antd'
import Layout from '@/components/Layout'
import './App.less'
import { useNavigate, useLocation } from 'react-router-dom'
import { getToken } from './utils/auth'

function App () {
  const location = useLocation()
  const navigate = useNavigate()
  useEffect(() => {
    const path = location.pathname === '/' ? '/home/dashboard' : location.pathname
    if (!getToken()) {
      navigate(`/auth/login?path=${encodeURIComponent(path)}`)
      return
    }
    if (location.pathname === '/') {
      navigate('/home/dashboard')
    }
  })

  return (
    <ConfigProvider
      theme={{
        token: {
          fontSize: 12,
          borderRadius: 4,
          colorPrimary: '#172c4d',
          colorBgLayout: '#fafafa',
          colorBorderSecondary: '#e7eaef',
        },
      }}
    >
      <Spin spinning={false}>
        <Layout></Layout>
      </Spin>
    </ConfigProvider>
  )
}

export default App
