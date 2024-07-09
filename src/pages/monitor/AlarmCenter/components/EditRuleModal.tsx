import { Button, Card, Drawer, Form, message, Select, Space, Col, Row, Checkbox, Input, Tooltip, TimePicker } from 'antd'
import { CloseOutlined, QuestionCircleTwoTone } from '@ant-design/icons'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { editAlarmRules, getProductList } from '@/api'
import { getProductInfo } from '@/api/product'
import { getDevice } from '@/api/devices'
import { ProductInfo } from '@/pages/gateway/ProductManage/types'
import useRequest from '@/hooks/useRequest'
import { RuleInfo } from '../types'
import { time2Timestamp } from '@/utils/time'
import dayjs from 'dayjs'
// import dayjs from 'dayjs'
// (window as any).dayjs = dayjs

const { useForm } = Form

export interface EditRuleModalProps {
  onFinish: () => void
}
export interface EditRuleModalRef {
  open: (ruleInfo?: RuleInfo) => void
}

export const EditRuleModal = forwardRef<EditRuleModalRef, EditRuleModalProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const [ruleInfo, setRuleInfo] = useState<RuleInfo>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [trigger, setTrigger] = useState<string>('设备数据触发')
  const [checkedNotify, setCheckedNotify] = useState<string[]>(['alarm'])
  const [decideConditionOptions, setDecideConditionOptions] = useState<{ label: string; value: string; }[]>([])

  const computDecideConditionOptions = useCallback((specs: string) => {
    try {
      const obj = JSON.parse(specs)
      const options = Object.entries(obj).map(([value, label]) => ({ value, label: label as string }))
      setDecideConditionOptions(options)
    } catch (error) {
      setDecideConditionOptions([])
    }
  }, [])

  const DeviceStatusOptions = [
    { label: '在线', value: '在线' },
    { label: '离线', value: '离线' },
  ]

  const optionsNotify = [
    { label: '告警中心', value: 'alarm', disabled: true },
    // { label: 'sms短信', value: 'sms' },
    { label: '企业微信机器人', value: '企业微信机器人' },
    { label: '钉钉机器人', value: '钉钉机器人' },
    { label: '飞书机器人', value: '飞书机器人' },
    { label: 'API接口', value: 'API接口' },
  ]

  // 获取产品接口
  const productTypeApi = useRequest(getProductList, {
    manual: false,
    formatData: (data) => (data.list || []).map((item: { name: any; id: any }) => ({ label: item.name, value: item.id })),
  })

  // 获取设备接口
  const devicesTypeApi = useRequest(getDevice, {
    manual: true,
    formatData: (data) => (data.list || []).map((item: { name: any; id: any }) => ({ label: item.name, value: item.id })),
  })

  // 获取产品详情
  const [productInfo, setProductInfo] = useState<ProductInfo>()
  const loadProductInfo = useCallback(({ productid }: { productid: string }) => {
    getProductInfo<ProductInfo>(productid)
      .then(resp => {
        if (resp.success) {
          setProductInfo(resp.result)
          setTimeout(() => {
            const trigger = form.getFieldValue(['trigger'])
            const code = form.getFieldValue(['sub_rule', 'option', 'code'])
            if (trigger === '设备数据触发' && code) {
              const property = resp.result.properties.find((property) => property.code === code)
              if (property?.type_spec?.specs) {
                computDecideConditionOptions(property.type_spec.specs)
              }
            }
          }, 1000)
        }
      })
  }, [])

  const propertyOptions = useMemo(() => (productInfo?.properties || []).filter((item) => ['int', 'float', 'bool', 'text', 'enum'].includes(item.type_spec.type)).map(({ name: label, code: value, type_spec }) => ({ label, value, type: type_spec.type, specs: type_spec.specs })), [productInfo?.properties])
  console.log('propertyOptions', propertyOptions)

  const eventOptions = useMemo(() => (productInfo?.events || []).map(({ name: label, code: value }) => ({ label, value })), [productInfo?.events])

  // 触发方式选择
  const triggerChange = (value: string) => {
    setTrigger(value)
    form.setFieldsValue({
      sub_rule: {
        option: {
          code: undefined,
          status: undefined,
          value_type: undefined,
          value_cycle: undefined,
          decide_condition_bool: undefined,
          decide_condition_text: undefined,
          decide_condition_enum: undefined,
        },
      },
    })
    setCodeType('')
  }
  // 产品选择
  const productChange = (value: string) => {
    console.log(`product-id ${value}`)
    loadProductInfo({ productid: value })
    devicesTypeApi.run({
      product_id: value,
    })
    form.setFieldsValue({
      sub_rule: {
        device_id: undefined,
        option: {
          code: undefined,
          value_type: undefined,
          value_cycle: undefined,
          decide_condition_bool: undefined,
          decide_condition_text: undefined,
          decide_condition_enum: undefined,
        },
      },
      decide_condition_1: undefined,
      decide_condition_2: undefined,
    })
    setCodeType('')
  }

  // 功能选择
  const optionChange = (value: string) => {
    console.log(`option ${value}`)
    form.setFieldsValue({
      sub_rule: {
        // device_id: undefined,
        option: {
          value_type: undefined,
          value_cycle: undefined,
          decide_condition_bool: undefined,
          decide_condition_text: undefined,
          decide_condition_enum: undefined,
        },
      },
      decide_condition_1: undefined,
      decide_condition_2: undefined,
    })
  }

  // 通知方式选择
  const notifyChange = (checkedValues: any) => {
    setCheckedNotify(checkedValues)
  }

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
    setRuleInfo(undefined)
    setCodeType('')
    setCheckedNotify([])
  }, [form])

  useImperativeHandle(ref, () => {
    return {
      open (ruleInfo) {
        setRuleInfo(ruleInfo)
        setIsModalOpen(true)
        if (ruleInfo) {
          form.setFieldsValue(ruleInfo)
        }
      },
    }
  }, [form])

  const dateFormat = 'HH:mm:ss'

  const [codeType, setCodeType] = useState('')

  const computCodeType = useCallback((codeType: string) => {
    console.log({ codeType, propertyOptions })
    const options = propertyOptions.find(({ value }) => value === codeType)
    options?.type ? setCodeType(options.type) : setCodeType('')
  }, [propertyOptions])

  const initialValues = useMemo(() => {
    console.log('init ruleInfo', ruleInfo)
    if (!ruleInfo) {
      return {
        trigger: '设备数据触发',
      }
    }
    const init = {
      ...(ruleInfo as any),
      // notify:
    }
    // init.silence_time = String(init.silence_time)
    init.notify = (ruleInfo.notify || []).map((item) => ({
      ...item,
      end_effect_time: dayjs(time2Timestamp(item.end_effect_time)),
      start_effect_time: dayjs(time2Timestamp(item.start_effect_time)),
      option: {
        ...item.option,
        phoneNumber: item.option.phoneNumber && item.option?.phoneNumber.slice(3),
      },
    }))
    init.trigger = init.sub_rule?.[0].trigger || '设备数据触发'
    if (init.sub_rule?.[0].option.decide_condition) {
      init.decide_condition_1 = init.sub_rule[0].option.decide_condition.split(' ')[0]
      init.decide_condition_2 = init.sub_rule[0].option.decide_condition.split(' ')[1]
    }
    init.sub_rule = init.sub_rule?.[0]
    if (init.sub_rule) {
      // const token = init.sub_rule?.option?.decide_condition?.slice(3, 4)
      // if (token === '{') {
      //   init.sub_rule.option.decide_condition_text = init.sub_rule?.option?.decide_condition?.slice(4, -1)
      // } else if (/\d/.test(token)) {
      //   init.sub_rule.option.decide_condition_enum = init.sub_rule?.option?.decide_condition?.slice(3)
      // } else if (/t|f/.test(token)) {
      //   init.sub_rule.option.decide_condition_bool = init.sub_rule?.option?.decide_condition?.slice(3)
      // }

      if (init.sub_rule?.option?.type === 'text') {
        init.sub_rule.option.decide_condition_text = init.sub_rule?.option?.decide_condition?.slice(2)
      } else if (init.sub_rule?.option?.type === 'enum') {
        init.sub_rule.option.decide_condition_enum = init.sub_rule?.option?.decide_condition?.slice(2)
      } else if (init.sub_rule?.option?.type === 'bool') {
        init.sub_rule.option.decide_condition_bool = init.sub_rule?.option?.decide_condition?.slice(2)
      }
    }
    console.log('init', init)
    return init
  }, [ruleInfo])

  useEffect(() => {
    console.log('initialValues', initialValues)
    if (initialValues.sub_rule?.product_id) {
      devicesTypeApi.run({
        product_id: initialValues.sub_rule.product_id,
      })
      loadProductInfo({ productid: initialValues.sub_rule.product_id })
    }
    setCheckedNotify(['alarm', ...(initialValues.notify || []).map(({ name }: { name: string }) => name)])
    triggerChange(initialValues.trigger)
    form.setFieldsValue(initialValues)
  }, [initialValues])

  useEffect(() => {
    initialValues.sub_rule?.code && computCodeType(initialValues.sub_rule.code)
  }, [initialValues, computCodeType])

  return (
    <Drawer
      title="编辑规则"
      placement="right"
      open={isModalOpen}
      width={650}
      closable={false}
      maskClosable={false}
      headerStyle={{ height: 51 }}
      destroyOnClose
      extra={<CloseOutlined onClick={handleClose} />}
      onClose={handleClose}
      footer={
        <Space>
          <Button
            type="primary"
            loading={submitting}
            disabled={submitting}
            onClick={() => {
              form.validateFields()
                .then(values => {
                  console.log('values', values)
                  // setSubmitting(true)
                  const params = {
                    id: ruleInfo?.id,
                    condition: 'anyone',
                    ...values,
                    // silence_time: silenceTime,
                    decide_condition_1: undefined,
                    decide_condition_2: undefined,
                    trigger: undefined,
                    notify: (values.notify || []).map((item: { end_effect_time: { format: (arg0: string) => any }; start_effect_time: { format: (arg0: string) => any }; option: { phoneNumber: any } }) => ({
                      ...item,
                      end_effect_time: item.end_effect_time.format(dateFormat),
                      start_effect_time: item.start_effect_time.format(dateFormat),
                      option: {
                        ...item.option,
                        phoneNumber: item.option.phoneNumber && `+86${item.option.phoneNumber}`,
                      },
                    })),
                  }
                  params.sub_rule.trigger = values.trigger
                  if (values.decide_condition_1 && values.decide_condition_2) {
                    params.sub_rule.option.decide_condition = `${values.decide_condition_1} ${values.decide_condition_2}`
                    // params.sub_rule.option.type = 'bool'
                  }
                  if (values.sub_rule.option.decide_condition_bool) {
                    params.sub_rule.option.decide_condition = `= ${params.sub_rule.option.decide_condition_bool}`
                    params.sub_rule.option.decide_condition_bool = undefined
                    params.sub_rule.option.type = 'bool'
                  }
                  if (values.sub_rule.option.decide_condition_text) {
                    params.sub_rule.option.decide_condition = `= ${params.sub_rule.option.decide_condition_text}`
                    params.sub_rule.option.decide_condition_text = undefined
                    params.sub_rule.option.type = 'text'
                  }
                  if (values.sub_rule.option.decide_condition_enum) {
                    params.sub_rule.option.decide_condition = `= ${params.sub_rule.option.decide_condition_enum}`
                    params.sub_rule.option.decide_condition_enum = undefined
                    params.sub_rule.option.type = 'enum'
                  }
                  params.sub_rule = [params.sub_rule]
                  console.log('params', params)

                  if (ruleInfo?.id) {
                    editAlarmRules(ruleInfo.id, params)
                      .then(resp => {
                        if (resp.success) {
                          message.success('编辑成功')
                          handleClose()
                          onFinish()
                        } else {
                          message.error(resp.errorMsg)
                        }
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  }
                })
            }}
          >确定</Button>
          <Button onClick={handleClose}>取消</Button>
        </Space>
      }
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={initialValues}
        onValuesChange={(changedValues) => {
          if (changedValues?.sub_rule?.option?.code) {
            computCodeType(changedValues.sub_rule.option.code)
          }
        }}
      >
        <Card>
          <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
            启动规则
          </div>
          <Form.Item
            label="触发方式"
            name={['trigger']}
            rules={[{ required: true, message: '请选择触发方式' }]}
          >
            <Select
              placeholder="请选择"
              onChange={triggerChange}
              allowClear
              options={[
                { value: '设备数据触发', label: '设备数据触发' },
                { value: '设备事件触发', label: '设备事件触发' },
                { value: '设备状态触发', label: '设备状态触发' },
              ]}
            />
          </Form.Item>
          <Row gutter={15}>
            <Col span={12}>
              <Form.Item
                label="产品"
                name={['sub_rule', 'product_id']}
                rules={[{ required: true, message: '不能为空' }]}
              >
                <Select
                  placeholder="请选择"
                  onChange={productChange}
                  loading={productTypeApi.loading}
                  showSearch
                  filterOption={false}
                  onSearch={(search) => productTypeApi.run({ name: search })}
                  allowClear
                  options={productTypeApi.data}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="设备"
                name={['sub_rule', 'device_id']}
                rules={[{ required: true, message: '不能为空' }]}
              >
                <Select
                  placeholder="请选择"
                  loading={devicesTypeApi.loading}
                  filterOption={false}
                  showSearch
                  onSearch={(search) => devicesTypeApi.run({
                    name: search,
                    product_id: form.getFieldValue(['sub_rule', 'product_id']),
                  })}
                  allowClear
                  options={devicesTypeApi.data}
                />
              </Form.Item>
            </Col>
          </Row>
          <Form.Item
            label={trigger === '设备数据触发' ? '功能' : trigger === '设备事件触发' ? '事件' : trigger === '设备状态触发' ? '设备状态' : ''}
            name={trigger === '设备状态触发' ? ['sub_rule', 'option', 'status'] : ['sub_rule', 'option', 'code']}
            rules={[{ required: true, message: '不能为空' }]}
          >
            <Select
              placeholder="请选择"
              onChange={optionChange}
              loading={productTypeApi.loading}
              showSearch
              allowClear
              options={trigger === '设备数据触发' ? propertyOptions : trigger === '设备事件触发' ? eventOptions : trigger === '设备状态触发' ? DeviceStatusOptions : []}
              onSelect={(value: string, option: any) => {
                console.log('onSelect', value, option)
                computDecideConditionOptions(option.specs)
              }}
            />
          </Form.Item>
          {trigger === '设备数据触发' && (<>
            {['int', 'float'].includes(codeType) && <>
              <Form.Item
                label="取值类型"
                name={['sub_rule', 'option', 'value_type']}
                rules={[{ required: true, message: '不能为空' }]}
              >
                <Select
                  placeholder="请选择"
                  allowClear
                  options={[
                    { value: 'original', label: '原始值' },
                    { value: 'avg', label: '平均值' },
                    { value: 'max', label: '最大值' },
                    { value: 'min', label: '最小值' },
                    { value: 'sum', label: '求和值' },
                  ]} />
              </Form.Item>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, nextValues) => {
                  return prevValues?.sub_rule?.option?.value_type !== nextValues?.sub_rule?.option?.value_type
                }}
              >
                {({ getFieldValue }) => {
                  return getFieldValue(['sub_rule', 'option', 'value_type']) !== 'original' && (<Form.Item
                    label="取值周期"
                    name={['sub_rule', 'option', 'value_cycle']}
                    rules={[{ required: true, message: '不能为空' }]}
                  >
                    <Select
                      placeholder="请选择"
                      allowClear
                      options={[
                        { value: '1分钟周期', label: '1分钟周期' },
                        { value: '5分钟周期', label: '5分钟周期' },
                        { value: '15分钟周期', label: '15分钟周期' },
                        { value: '30分钟周期', label: '30分钟周期' },
                        { value: '60分钟周期', label: '60分钟周期' },
                      ]} />
                  </Form.Item>)
                }}
              </Form.Item>
              <Row gutter={15}>
                <Col span={6}>
                  <Form.Item
                    label="判断条件"
                    name="decide_condition_1"
                    rules={[{ required: true, message: '不能为空' }]}
                  >
                    <Select
                      placeholder="请选择"
                      // onChange={decideChange}
                      allowClear
                      options={[
                        { value: '>', label: '>' },
                        { value: '<', label: '<' },
                        { value: '=', label: '=' },
                        { value: '>=', label: '>=' },
                        { value: '<=', label: '<=' },
                        { value: '!=', label: '!=' },
                      ]} />
                  </Form.Item>
                </Col>
                <Col span={18}>
                  <Form.Item
                    label=""
                    name="decide_condition_2"
                    rules={[{ required: true, message: '不能为空' }]}
                  >
                    <Input style={{ marginTop: '28px' }} allowClear placeholder="请输入" />
                  </Form.Item>
                </Col>
              </Row>
            </>}
            {/* {['int', 'float'].includes(codeType)
              || <Form.Item
                label="持续时间"
                name={['sub_rule', 'option', 'duration']}
                rules={[{ required: true, message: '不能为空' }]}
              >
                <Select
                  placeholder="请选择"
                  // onChange={durationChange}
                  allowClear
                  options={[
                    { value: '1个周期', label: '1个周期' },
                    { value: '3个周期', label: '3个周期' },
                    { value: '5个周期', label: '5个周期' },
                    { value: '10个周期', label: '10个周期' },
                  ]} />
              </Form.Item>
            } */}
            {['bool'].includes(codeType) && <Form.Item
              label="判断条件"
              name={['sub_rule', 'option', 'decide_condition_bool']}
              rules={[{ required: true, message: '不能为空' }]}
            >
              <Select
                placeholder="请选择"
                allowClear
                options={[
                  { value: 'true', label: 'True' },
                  { value: 'false', label: 'False' },
                ]} />
            </Form.Item>}
            {['text'].includes(codeType) && <Form.Item
              label="判断条件"
              name={['sub_rule', 'option', 'decide_condition_text']}
              rules={[{ required: true, message: '不能为空' }]}
            >
              <Input placeholder="请输入"></Input>
            </Form.Item>}
            {['enum'].includes(codeType) && <Form.Item
              label="判断条件"
              name={['sub_rule', 'option', 'decide_condition_enum']}
              rules={[{ required: true, message: '不能为空' }]}
            >
              <Select
                placeholder="请选择"
                allowClear
                options={decideConditionOptions}
                // options={[
                //   { value: '0', label: '红' },
                //   { value: '1', label: '绿' },
                //   { value: '2', label: '蓝' },
                // ]}
              />
            </Form.Item>}
          </>)
          }
        </Card>
        <Form.Item
          label={<div>
            <div>静默时间</div>
            <div style={{ color: '#666' }} className="mb20">
              若已配置静默时间，则告警规则触发告警后，在设定的时间范围内将不再重复生成告警和通知。超出设定时间告警仍未恢复，则会再次触发告警。
            </div>
          </div>}
          name="silence_time"
          className="mt20"
        >
          <Select
            placeholder="请选择"
            // onChange={silenceTimeChange}
            allowClear
            options={[
              { value: 0, label: '无' },
              { value: 5 * 60 * 1000, label: '5分钟' },
              { value: 10 * 60 * 1000, label: '10分钟' },
              { value: 15 * 60 * 1000, label: '15分钟' },
              { value: 30 * 60 * 1000, label: '30分钟' },
              { value: 60 * 60 * 1000, label: '1小时' },
              { value: 3 * 60 * 60 * 1000, label: '3小时' },
              { value: 6 * 60 * 60 * 1000, label: '6小时' },
              { value: 12 * 60 * 60 * 1000, label: '12小时' },
              { value: 24 * 60 * 60 * 1000, label: '24小时' },
            ]}
          />
        </Form.Item>
        <Form.List name="notify">
          {(fields, actions) => {
            return (<>
              <Form.Item
                label={<div>
                  <div>通知方式</div>
                  <div style={{ color: '#666' }} className="mb20">
                    满足触发条件后所进行的告警通知方式，告警列表中可查看所有告警记录
                  </div>
                </div>}
              // name={['name']}
              >
                <Checkbox.Group
                  options={optionsNotify}
                  defaultValue={['alarm']}
                  value={checkedNotify}
                  onChange={(checkList) => {
                    notifyChange(checkList)
                    if (checkList.length > checkedNotify.length) {
                      // 增加
                      const addType = checkList[checkList.length - 1]
                      actions.add({
                        name: addType,
                      })
                    } else {
                      // 减少
                      const subTypeIndex = checkedNotify.findIndex((type) => !checkList.includes(type))
                      // 因为“告警中心”是默认打钩选项，但是数据中又不能存在，所以checkList中不存在“告警中心”。
                      // defaultValue和checkedNotify的默认第一项为“告警中心”，所以移除时index - 1
                      actions.remove(subTypeIndex - 1)
                    }
                  }}
                />
              </Form.Item>
              {fields.map(({ key, name, ...field }) => {
                if (checkedNotify[name + 1] === 'sms') {
                  return (<Card key={key}>
                    <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
                      sms短信
                    </div>
                    <Form.Item
                      {...field}
                      label="手机号"
                      name={[name, 'option', 'phoneNumber']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <Input addonBefore="+86" placeholder="请输入手机号" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={
                        <div>
                          <span>生效时间</span>&nbsp;
                          <Tooltip
                            placement="rightTop"
                            title="该告警规则仅在生效时间段内发送邮件通知。"
                          >
                            <QuestionCircleTwoTone />
                          </Tooltip>
                        </div>
                      }
                      name={[name, 'start_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                      style={{ float: 'left' }}
                    >
                      <TimePicker
                        placeholder="请输入开始时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ float: 'left', marginTop: '28px' }}
                    >
                      <span className="ml20 mr20 mt20">-</span>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label=""
                      name={[name, 'end_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <TimePicker
                        placeholder="请输入结束时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                        style={{ marginTop: '28px' }}
                      />
                    </Form.Item>
                  </Card>)
                }
                if (checkedNotify[name + 1] === '企业微信机器人') {
                  return (<Card key={key} className="mt10">
                    <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
                      企业微信机器人
                    </div>
                    <Form.Item
                      {...field}
                      label="通知地址"
                      name={[name, 'option', 'webhook']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <Input addonBefore="webhook" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={
                        <div>
                          <span>生效时间</span>&nbsp;
                          <Tooltip
                            placement="rightTop"
                            title="该告警规则仅在生效时间段内发送邮件通知。"
                          >
                            <QuestionCircleTwoTone />
                          </Tooltip>
                        </div>
                      }
                      name={[name, 'start_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                      style={{ float: 'left' }}
                    >
                      <TimePicker
                        placeholder="请输入开始时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ float: 'left', marginTop: '28px' }}
                    >
                      <span className="ml20 mr20 mt20">-</span>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label=""
                      name={[name, 'end_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <TimePicker
                        placeholder="请输入结束时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                        style={{ marginTop: '28px' }}
                      />
                    </Form.Item>
                  </Card>)
                }
                if (checkedNotify[name + 1] === '钉钉机器人') {
                  return (<Card key={key} className="mt10">
                    <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
                      钉钉机器人
                    </div>
                    <Form.Item
                      {...field}
                      label="通知地址"
                      name={[name, 'option', 'webhook']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <Input addonBefore="webhook" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={
                        <div>
                          <span>生效时间</span>&nbsp;
                          <Tooltip
                            placement="rightTop"
                            title="该告警规则仅在生效时间段内发送邮件通知。"
                          >
                            <QuestionCircleTwoTone />
                          </Tooltip>
                        </div>
                      }
                      name={[name, 'start_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                      style={{ float: 'left' }}
                    >
                      <TimePicker
                        placeholder="请输入开始时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ float: 'left', marginTop: '28px' }}
                    >
                      <span className="ml20 mr20 mt20">-</span>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label=""
                      name={[name, 'end_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <TimePicker
                        placeholder="请输入结束时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                        style={{ marginTop: '28px' }}
                      />
                    </Form.Item>
                  </Card>)
                }
                if (checkedNotify[name + 1] === '飞书机器人') {
                  return (<Card key={key} className="mt10">
                    <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
                      飞书机器人
                    </div>
                    <Form.Item
                      label="通知地址"
                      {...field}
                      name={[name, 'option', 'webhook']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <Input addonBefore="webhook" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={
                        <div>
                          <span>生效时间</span>&nbsp;
                          <Tooltip
                            placement="rightTop"
                            title="该告警规则仅在生效时间段内发送邮件通知。"
                          >
                            <QuestionCircleTwoTone />
                          </Tooltip>
                        </div>
                      }
                      name={[name, 'start_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                      style={{ float: 'left' }}
                    >
                      <TimePicker
                        placeholder="请输入开始时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ float: 'left', marginTop: '28px' }}
                    >
                      <span className="ml20 mr20 mt20">-</span>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label=""
                      name={[name, 'end_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <TimePicker
                        placeholder="请输入结束时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                        style={{ marginTop: '28px' }}
                      />
                    </Form.Item>
                  </Card>)
                }
                if (checkedNotify[name + 1] === 'API接口') {
                  return (<Card key={key} className="mt10">
                    <div style={{ color: '#666', fontSize: '14px' }} className="mb10">
                      API接口
                    </div>
                    <Form.Item
                      label="通知地址"
                      {...field}
                      name={[name, 'option', 'webhook']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <Input addonBefore="post" placeholder="请输入" />
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label={
                        <div>
                          <span>生效时间</span>&nbsp;
                          <Tooltip
                            placement="rightTop"
                            title="该告警规则仅在生效时间段内发送邮件通知。"
                          >
                            <QuestionCircleTwoTone />
                          </Tooltip>
                        </div>
                      }
                      name={[name, 'start_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                      style={{ float: 'left' }}
                    >
                      <TimePicker
                        placeholder="请输入开始时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                      />
                    </Form.Item>
                    <Form.Item
                      style={{ float: 'left', marginTop: '28px' }}
                    >
                      <span className="ml20 mr20 mt20">-</span>
                    </Form.Item>
                    <Form.Item
                      {...field}
                      label=""
                      name={[name, 'end_effect_time']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <TimePicker
                        placeholder="请输入结束时间"
                        // defaultOpenValue={dayjs('00:00:00', 'HH:mm:ss')}
                        format={dateFormat}
                        style={{ marginTop: '28px' }}
                      />
                    </Form.Item>
                  </Card>)
                }
                return null
              })}
            </>)
          }}
        </Form.List>
      </Form>
    </Drawer>
  )
})

export default EditRuleModal
