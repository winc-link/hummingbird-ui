import React, { useEffect, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { UserOutlined, BookOutlined } from '@ant-design/icons'
import { Layout, Space, Menu, Avatar, Dropdown, Modal, Form, Input, MenuProps, message } from 'antd'
import { menus } from '@/routes/menus'
import './style.less'
import { clearUser } from '@/utils/auth'
import { changePassword } from '@/api'

const { Header, Content, Sider } = Layout
const { useForm } = Form
const { useMessage } = message

export interface LyaoutProps {

}

const Lyaout: React.FC<LyaoutProps> = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [headerSelectKey, setHeaderSelectKey] = useState<string>('')

  const [messageApi, contextHolder] = useMessage()

  const location = useLocation()
  const navigate = useNavigate()
  console.log('console', location, navigate)

  // const headerMenus = useMemo(() => {
  //   return menus!.map((item) => {
  //     const { key, label, icon } = item as SubMenuType
  //     return { key, label, icon }
  //   })
  // }, [])

  const siderMenus = useMemo(() => {
    console.log(menus)

    return menus
    // const headerMenus = menus!.find(item => {
    //   const { key } = item as SubMenuType
    //   return key === headerSelectKey
    // }) as SubMenuType

    // return headerMenus?.children || []
  }, [headerSelectKey])

  const [sliderMenuOpenKeys, setSliderMenuOpenKeys] = useState<string[]>([])

  useEffect(() => {
    const { paths } = menus?.reduce((r, menu) => {
      if (Array.isArray(menu.children)) {
        const findItem = menu.children.find((item) => item.key === location.pathname)
        console.log('findItem', findItem)
        if (findItem) {
          r.paths.push(menu.key)
          // r.push(menu.key, findItem.key)
          return r
        }
      }
      // if (menu.key === location.pathname) {
      //   r.push(menu.key)
      // }
      return r
    }, { paths: [] } as { paths: string[] })
    const { titles } = menus?.reduce((r, menu) => {
      console.log(location.pathname)
      if (location.pathname === '/auth/login') {
        r.titles.push('登录')
      } else if (menu.key === location.pathname) {
        r.titles.push(menu.label)
      } else if (Array.isArray(menu.children)) {
        const findItem = menu.children.find((item) => item.key === location.pathname)
        console.log('findItem', findItem)
        if (findItem) {
          r.titles.push(findItem.label || menu.label)
          // r.push(menu.key, findItem.key)
          return r
        }
      }
      // if (menu.key === location.pathname) {
      //   r.push(menu.key)
      // }
      return r
    }, { titles: [] } as { titles: string[] })
    console.log(paths, titles)
    if (titles[titles.length - 1]) {
      document.title = titles[titles.length - 1]
      localStorage.setItem('title', titles[titles.length - 1])
    } else {
      document.title = localStorage.getItem('title') || ''
    }
    setSliderMenuOpenKeys(paths)
  }, [location.pathname])

  useEffect(() => {
    const moduleRoute = location.pathname.match(/(?<!\w)\/\w+/g)
    if (Array.isArray(moduleRoute)) {
      setHeaderSelectKey(moduleRoute[0])
    }
  }, [])

  if (location.pathname === '/auth/login') {
    return <Outlet></Outlet>
  }
  const [form] = useForm()
  const handleOk = async () => {
    const values = await form.validateFields()
    console.log('values', values)
    values.newPassword1 = undefined
    changePassword(values)
      .then(resp => {
        if (resp.success) {
          messageApi.open({ type: 'success', content: '修改成功' })
          setIsModalOpen(false)
          setTimeout(() => {
            navigate('/auth/login')
          }, 1000)
        } else {
          messageApi.open({ type: 'error', content: resp.errorMsg })
        }
      })
  }

  const handleCancel = () => {
    setIsModalOpen(false)
    form.resetFields()
  }
  const [isModalOpen, setIsModalOpen] = useState(false)
  const showModal = () => {
    setIsModalOpen(true)
  }

  const items: MenuProps['items'] = [
    {
      key: 'password',
      label: (
        <>
          <div
            onClick={showModal}
          >
            修改密码
          </div>
          <Modal
            open={isModalOpen}
            onOk={handleOk}
            onCancel={handleCancel}
            okText="确定"
            cancelText="取消"
            maskClosable={false}
          >
            {contextHolder}
            <Form form={form} layout="vertical" style={{ marginTop: '40px' }}>
              <Form.Item
                label="原密码"
                name="currentPassword"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input placeholder="请输入原密码" />
              </Form.Item>
              <Form.Item
                label="新密码"
                name="newPassword"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input.Password placeholder="请输入新密码" />
              </Form.Item>
              <Form.Item
                label="确认密码"
                name="newPassword1"
                rules={[{ required: true, message: '请输入' }]}
              >
                <Input.Password placeholder="请输入确认密码" />
              </Form.Item>
            </Form>
          </Modal></>
      ),
    },
    {
      key: 'logout',
      label: (
        <div
          onClick={() => {
            clearUser()
            navigate('/auth/login')
          }}
        >
          退出登录
        </div>
      ),
    },
  ]

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <Space size={20}>
          <div
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigate('/home/dashboard')
            }}>
            <img src={require('@/assets/images/newlogo.png')} alt="" style={{ marginTop: '15px', marginLeft: '-20px', height: '25px', float: 'left' }}/>
            <div style={{ fontSize: '14px', marginLeft: '20px', fontWeight: 600 }}>
              Hummingbird
            </div>
          </div>
          {/* <Menu
            mode="horizontal"
            items={headerMenus}
            selectedKeys={[headerSelectKey]}
            onClick={({ key }) => {
              setHeaderSelectKey(key)
            }}
          /> */}
          {/* <Badge className="header-message" color="geekblue" dot>
            <MailOutlined />
          </Badge> */}
          <div></div>
          <BookOutlined onClick={() => {
            window.open('https://doc.hummingbird.winc-link.com/')
          }}/>
          <Dropdown
            menu={{ items }}
            placement="bottom"
            arrow={{ pointAtCenter: true }}
            trigger={['click']}
          >
            <Avatar icon={<UserOutlined />} size="small" style={{ cursor: 'pointer' }} />
          </Dropdown>
        </Space>
      </Header>
      <Layout className="main-body" hasSider>
        <Sider
          width={200}
          className="main-sider"
          theme="light"
          collapsible
          collapsed={collapsed}
          onCollapse={value => setCollapsed(value)}
        >
          <Menu
            mode="inline"
            style={{ height: '100%', borderRight: 0 }}
            items={siderMenus}
            openKeys={sliderMenuOpenKeys}
            onOpenChange={openKeys => {
              setSliderMenuOpenKeys(openKeys)
            }}
            selectedKeys={[location.pathname]}
            onClick={({ key }) => {
              navigate(key)
            }}
          />
        </Sider>
        <Layout className="main-container" style={{ marginLeft: collapsed ? 80 : 200 }}>
          <Content className="main-view">
            <Outlet></Outlet>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  )
}

export default Lyaout
