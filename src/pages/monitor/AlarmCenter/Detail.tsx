// import dayjs from 'dayjs'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { MinusCircleFilled, CheckCircleFilled, EditOutlined } from '@ant-design/icons'
import { AdvanceBreadcrumb } from '@/components/Breadcrumb'
import { editRules, getRuleInfo } from '@/api'
import { EditRuleModal, EditRuleModalRef } from './components/EditRuleModal'
import { RuleInfo } from './types'
import './style.less'
import { Card, Col, Row, Space, Button, Divider, Empty, Typography, Modal, Form, Input, message, Select } from 'antd'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'

dayjs.extend(duration)

const { Text } = Typography
const { useForm } = Form
const { useMessage } = message

const RuleDetail = () => {
  const [messageApi, contextHolder] = useMessage()
  const params = useParams<{ id: string }>()
  const editRuleModalRef = useRef<EditRuleModalRef>(null)
  const [ruleInfo, setRuleInfo] = useState<RuleInfo>()
  const [click, setClick] = useState<string>('')

  const [form] = useForm()
  const { TextArea } = Input

  const loadRuleInfo = useCallback(() => {
    getRuleInfo<RuleInfo>(params.id!)
      .then((resp) => {
        if (resp.success) {
          setRuleInfo(resp.result)
        }
      }).catch((err) => {
        console.log(err)
      })
  }, [params])

  function formatDuration (ms: number) {
    if (ms === 0) {
      return '无'
    }
    const d = dayjs.duration(ms)
    let formattedDuration
    if (d.asHours() >= 1) {
      formattedDuration = `${Math.floor(d.asHours())} 小时`
    } else if (d.asMinutes() >= 1) {
      formattedDuration = `${Math.floor(d.asMinutes())} 分钟`
    } else {
      formattedDuration = `${Math.floor(d.asSeconds())} 秒`
    }
    return formattedDuration
  }
  console.log('ruleInfo', ruleInfo)

  const [open, setOpen] = useState(false)
  const showNameModal = () => {
    setOpen(true)
  }

  const handleOk = async () => {
    try {
      const text = await form.validateFields()
      const { name, alert_level, description } = text
      const params = {
        id: ruleInfo?.id,
        name,
        alert_level,
        description,
      }
      console.log('params', params)
      if (click === 'name') {
        params.alert_level = undefined
        params.description = undefined
      }
      if (click === 'alert_level') {
        params.name = undefined
        params.description = undefined
      }
      if (click === 'description') {
        if (!description) {
          message.warning('请输入描述信息')
          return
        }
        params.name = undefined
        params.alert_level = undefined
      }
      // console.log('params', params)
      if (ruleInfo?.id) {
        editRules(ruleInfo.id, params)
          .then(resp => {
            if (resp.success) {
              messageApi.open({ type: 'success', content: '编辑成功' })
              setOpen(false)
              loadRuleInfo()
            } else {
              messageApi.open({ type: 'error', content: resp.errorMsg })
            }
          })
      }
    } catch (error) {
      console.log(error)
    }
  }
  console.log(handleOk)

  const handleCancel = () => {
    setOpen(false)
    form.resetFields()
    setClick('')
  }

  const initialValues = {
    name: ruleInfo?.name || '',
    alert_level: ruleInfo?.alert_level || '',
    description: ruleInfo?.description || '',
  }

  useEffect(() => {
    loadRuleInfo()
  }, [params, loadRuleInfo])

  return (
    <>
      <EditRuleModal
        ref={editRuleModalRef}
        onFinish={loadRuleInfo}
      ></EditRuleModal>
      <AdvanceBreadcrumb
        hasBack
        title={
          <div className="flex-center">
            <Text style={{ fontSize: 17 }}>{ruleInfo?.name || '--'}</Text>
            <EditOutlined className="ml10"
              onClick={() => {
                showNameModal()
                setClick('name')
              }}
            />
          </div>
        }
        describe="告警规则详情提供基础信息、告警规则管理等功能。"
        breadcrumb={[
          { label: '告警中心', to: '/monitor/alarmCenter/list' },
          { label: `规则详情 [ ${ruleInfo?.name || ''} ]`, to: '' },
        ]}
        background={require('@/assets/images/head-bg.8b029587.png')}
      />
      <Card>
        <Row className="mt20">
          <Col span={6}>
            启用状态：
            {ruleInfo?.status === 'running'
              ? (<Space><CheckCircleFilled style={{ color: '#55af70' }} />启用</Space>)
              : ruleInfo?.status === 'stopped'
                ? (<Space><MinusCircleFilled style={{ color: '#87909d' }} />禁用</Space>)
                : '-'
            }
          </Col>
          <Col span={6}>
            创建时间：{dayjs(ruleInfo?.created).format('YYYY-MM-DD HH:mm:ss')}
          </Col>
          <Col span={6}>
            告警类型：{ruleInfo?.alert_type}
          </Col>
          <Col span={6}>
            告警级别：{ruleInfo?.alert_level}
            <EditOutlined className="ml10"
              onClick={() => {
                showNameModal()
                setClick('alert_level')
              }}
            />
          </Col>
          <Col span={18} className="mt15">
            规则描述：{ruleInfo?.description}
            <EditOutlined className="ml10"
              onClick={() => {
                showNameModal()
                setClick('description')
              }}
            />
          </Col>
        </Row>
        <div className="ruleInfo-title mt20">
          <span style={{ fontSize: '14px', fontWeight: '600' }}>
            规则内容
          </span>
          <Button
            type="primary"
            onClick={() => {
              editRuleModalRef.current?.open(ruleInfo)
            }}
          >编辑规则</Button>
        </div>
        {ruleInfo?.sub_rule
          ? (<div className="ruleInfo-content">
            <div className="ruleInfo-content__item" style={{ backgroundColor: '#fafafa' }}>
              <span className="ml20 mr20">触发条件</span>
              <span className="ml20">限制：{ruleInfo?.condition === 'anyone' ? '满足任意条件执行' : '满足全部条件执行'}
              </span>
            </div>
            {(ruleInfo?.sub_rule || []).map((item, index) => (
              <div key={index + 1} className="ruleInfo-content__item">
                <div className="ruleInfo-content__title">条件 {index + 1}</div>
                <span className="ml20" style={{ whiteSpace: 'pre' }}>{item?.condition}</span>
              </div>
            ))}
            {/* <span className="ml20">
                {ruleInfo?.sub_rule[0].trigger}：产品：{ruleInfo?.sub_rule[0].product_name}
              </span>
              <Divider type="vertical" className="ml20" />
              <span className="ml15">
                设备：{ruleInfo?.sub_rule[0].device_name}
              </span>
              <Divider type="vertical" className="ml20" />
              {ruleInfo?.sub_rule[0].trigger === '设备数据触发' && (
                <><span className="ml15">
                  功能：{ruleInfo?.sub_rule[0].code}
                </span><Divider type="vertical" className="ml20" /><span className="ml15">
                    触发条件：
                  {ruleInfo?.sub_rule[0].option.value_type && (ruleInfo?.sub_rule[0].option.value_type)
                    .replace(/original/, '原始值')
                    .replace(/avg/, '平均值')
                    .replace(/max/, '最大值')
                    .replace(/min/, '最小值')
                    .replace(/mum/, '最小值')}
                  {ruleInfo?.sub_rule[0].option.value_cycle && (`${ruleInfo?.sub_rule[0].option.value_cycle}`)}
                  {ruleInfo?.sub_rule[0].option.decide_condition}
                </span></>
              )}
              {ruleInfo?.sub_rule[0].trigger === '设备状态触发' && (
                <><span className="ml15">
                  设备状态：{ruleInfo?.sub_rule[0].option.status}
                </span></>
              )}
              {ruleInfo?.sub_rule[0].trigger === '设备事件触发' && (
                <><span className="ml15">
                  事件：{ruleInfo?.sub_rule[0].option.code}
                </span></>
              )} */}
            <div className="ruleInfo-content__item" style={{ backgroundColor: '#fafafa' }}>
              <span className="ml20">通知方式</span>
            </div>
            <div className="ruleInfo-content__item">
              <div className="ruleInfo-content__title">通知 1</div>
              <span className="ml20">告警中心</span>
            </div>
            {(ruleInfo?.notify || []).map((item, index) => (
              <div key={index + 1} className="ruleInfo-content__item">
                <div className="ruleInfo-content__title">通知 {index + 2}</div>
                {item.name === 'sms'
                  ? <><span className="ml20">{item.name} 短信</span>
                    <Divider type="vertical" className="ml20" />
                    <span className="ml15">
                      手机号：{item.option.phoneNumber}
                    </span></>
                  : <><span className="ml20">{item.name}</span>
                    <Divider type="vertical" className="ml20" />
                    <span className="ml15">
                      通知地址：{item.option.webhook}
                    </span></>
                }
                <Divider type="vertical" className="ml20" />
                <span className="ml15">生效时间：{item.start_effect_time} - {item.end_effect_time}</span>
              </div>
            ))}
            <div className="ruleInfo-content__item" style={{ backgroundColor: '#fafafa' }}>
              <span className="ml20">静默时间</span>
            </div>
            <div className="ruleInfo-content__item">
              <div className="ruleInfo-content__title">时间</div>
              <span className="ml20">{formatDuration(ruleInfo?.silence_time)}</span>
            </div>
          </div>)
          : <div className="ruleInfo-content" style={{ height: '400px' }}>
            <div className="ruleInfo-content__none">
              <Empty description={false} />
              <div style={{ fontSize: '14px' }}>
                尚未添加任何条件
              </div>
              <div style={{ color: '#71777e' }} className="mt15">
                点击
                <span
                  style={{ color: '#2979e7', cursor: 'pointer' }}
                  onClick={() => {
                    editRuleModalRef.current?.open(ruleInfo)
                  }}
                >
                  编辑规则
                </span>
                ，进行规则条件、动作设置
              </div>
            </div>
          </div>
        }
      </Card>
      {contextHolder}
      <Modal
        open={open}
        onOk={handleOk}
        onCancel={handleCancel}
        okText="确定"
        cancelText="取消"
        maskClosable={false}
        title={click === 'name' ? '编辑规则名称' : click === 'alert_level' ? '编辑告警级别' : click === 'description' ? '编辑描述信息' : ''}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={initialValues}
        >
          {click === 'name' && <Form.Item
            label="规则名称"
            name="name"
            rules={[
              {
                // required: true,
                validator (rule, value, callback) {
                  if (!value) {
                    callback('请输入规则名称')
                  } else if (/^[a-zA-Z\u4e00-\u9fa5][a-zA-Z0-9\u4e00-\u9fa5_-]{0,31}$/.test(value)) {
                    callback()
                  } else {
                    callback('1-32位字符，支持中文、英文、数字及特殊字符_-，必须以英文或中文字符开头')
                  }
                },
              },
            ]}
          >
            <Input placeholder="1-32位字符，支持中文、英文、数字及特殊字符_-，必须以英文或中文字符开头"></Input>
          </Form.Item>}
          {click === 'alert_level' && <Form.Item
            label="告警级别"
            name="alert_level"
          >
            <Select
              placeholder="请选择"
              options={[
                { value: '紧急', label: '紧急' },
                { value: '重要', label: '重要' },
                { value: '次要', label: '次要' },
                { value: '提示', label: '提示' },
              ]}
            />
          </Form.Item>}
          {click === 'description' && <Form.Item
            label="规则描述"
            name="description"
          >
            <TextArea
              showCount
              maxLength={100}
              placeholder="请输入描述信息"
              rows={4}></TextArea>
          </Form.Item>}
        </Form>
      </Modal>
    </>
  )
}

export default RuleDetail
