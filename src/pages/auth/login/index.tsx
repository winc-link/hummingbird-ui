import { Login, getInitInfo, initPassword } from '@/api'
import useRequest from '@/hooks/useRequest'
import { setUser } from '@/utils/auth'
import { Button, Form, Input, message } from 'antd'
import React, { useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import './style.less'

export default function login () {
  const [search] = useSearchParams()
  const navigate = useNavigate()
  const initInfo = useRequest(getInitInfo)

  // console.log(initInfo.data?.isInit)

  console.log(search)
  const loginSuccess = useCallback(() => {
    const path = search.get('path') || '/home/dashboard'
    navigate(path)
  }, [])

  const onFinish = (values: any) => {
    Login(values)
      .then(resp => {
        if (resp.success) {
          setUser(resp.result)
          loginSuccess()
        } else {
          message.error(resp.errorMsg)
        }
      })
  }

  const onInitFinish = (values: any) => {
    values.password1 = undefined
    initPassword(values)
      .then(resp => {
        if (resp.success) {
          message.success('初始化密码成功')
          initInfo.reload()
        } else {
          message.error(resp.errorMsg)
        }
      })
  }

  return (<>
    <div className="login">
      <div className="login-content">
        <div className="login-content__left">
          <img className="ml20" style={{ marginTop: '40px' }} src={require('@/assets/images/logo.png')} alt="" />
          <div className="login-content__leftTitle">
            赢创万联 物联网平台
          </div>
          {/* <img
            className="login-content__img"
            src={require('@/assets/images/background.png')}
            alt="" /> */}
        </div>
        {initInfo.data?.isInit
          ? (<div className="login-content__right">
            <div className="login-content__rightTitle">
              密码登录
            </div>
            <Form
              name="basic"
              style={{
                margin: '80px 80px',
              }}
              onFinish={onFinish}
              autoComplete="off"
              className="login-form"
            >
              <Form.Item
                name="username"
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                ]}
              >
                <Input placeholder="账号" />
              </Form.Item>

              <Form.Item
                name="password"
                style={{ marginTop: '60px' }}
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                ]}
              >
                <Input.Password placeholder="密码" />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{
                    backgroundColor: '#232F3E',
                    borderRadius: '40px',
                    color: '#fefeff',
                    width: '80%',
                    height: '50px',
                    marginTop: '60px',
                    marginLeft: '50px',
                  }}
                  htmlType="submit">
                  登录
                </Button>
              </Form.Item>
            </Form>
          </div>)
          : (<div className="login-content__right">
            <div className="login-content__rightTitle">
              初始化密码
            </div>
            <Form
              name="basic"
              style={{
                margin: '80px 80px',
              }}
              onFinish={onInitFinish}
              autoComplete="off"
              className="login-form"
            >
              <Form.Item
                name="newPassword"
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                ]}
              >
                <Input placeholder="密码" />
              </Form.Item>
              <Form.Item
                name="password1"
                style={{ marginTop: '60px' }}
                dependencies={['newPassword']}
                rules={[
                  {
                    required: true,
                    message: '请输入',
                  },
                  ({ getFieldValue }) => ({
                    validator (_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve()
                      }
                      return Promise.reject(new Error('两次密码输⼊不⼀致'))
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="确认密码" />
              </Form.Item>

              <Form.Item>
                <Button
                  style={{
                    backgroundColor: '#232F3E',
                    borderRadius: '40px',
                    color: '#fefeff',
                    width: '80%',
                    height: '50px',
                    marginTop: '60px',
                    marginLeft: '50px',
                  }}
                  htmlType="submit">
                  确定
                </Button>
              </Form.Item>
            </Form>
          </div>)
        }
      </div>

      <div className="login-copyright">Copyright © 2021-2023 赢创万联 All Rights Reserved. 粤ICP备2022101171号-1</div>
    </div>
  </>)
}
