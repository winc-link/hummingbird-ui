import { Button, Card, Col, Drawer, Form, Input, message, Row, Select, Space } from 'antd'
import { CloseOutlined, MinusCircleOutlined, PlusOutlined } from '@ant-design/icons'
import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { editScene, getDevice, getProductInfo, getProductList, SceneData } from '@/api'
import { ProductInfo } from '@/pages/gateway/ProductManage/types'
import useRequest from '@/hooks/useRequest'
import useFormDependencies from '@/hooks/useFormDependencies'
import SelectWeekDays from './SelectWeekDays'
import RequestSelect from './RequestSelect'

const { useForm } = Form

export interface EditSceneProps {
  onFinish: () => void;
}
export interface EditSceneRef {
  open: (record?: SceneData) => void;
}

export const EditScene = forwardRef<EditSceneRef, EditSceneProps>(
  ({ onFinish }, ref) => {
    const [form] = useForm()
    const [submitting, setSubmitting] = useState<boolean>(false)
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
    const [record, setRecord] = useState<SceneData>()

    const handleClose = useCallback(() => {
      // form.resetFields();
      setIsModalOpen(false)
      // const change = {
      //   decide_condition_1: undefined,
      //   decide_condition_2: undefined,
      //   conditions: {
      //     option: {
      //       condition_type: 'notify',
      //       trigger: undefined,
      //       product_id: undefined,
      //       device_id: undefined,
      //       code: undefined,
      //       value_type: undefined,
      //       value_cycle: undefined,
      //       decide_condition_bool: undefined,
      //       decide_condition_text: undefined,
      //       decide_condition_enum: undefined,
      //       status: undefined,
      //       cron_expression: undefined,
      //     },
      //   },
      // }
      // form.setFieldsValue(change)
      form.setFieldsValue({
        decide_condition_1: undefined,
        decide_condition_2: undefined,
        conditions: {
          condition_type: 'notify',
          option: {
            trigger: '设备数据触发',
            product_id: undefined,
            device_id: undefined,
            code: undefined,
            value_type: undefined,
            value_cycle: undefined,
            decide_condition_bool: undefined,
            decide_condition_text: undefined,
            decide_condition_enum: undefined,
            status: undefined,
            cron_expression: undefined,
          },
        },
        actions: [],
      })
      setCodeType('')
    }, [form])

    console.log('record', record)

    const [trigger, setTrigger] = useState<string>('设备数据触发')
    const [codeType, setCodeType] = useState('')
    const [actionCodeType, setActionCodeType] = useState<string[]>([])
    // console.log(trigger)
    console.log('actionCodeType', actionCodeType)

    // 获取产品接口
    const productTypeApi = useRequest(getProductList, {
      manual: false,
      formatData: (data) =>
        (data.list || []).map((item: { name: any; id: any }) => ({
          label: item.name,
          value: item.id,
        })),
    })

    // 获取设备接口
    const devicesTypeApi = useRequest(getDevice, {
      manual: true,
      formatData: (data) =>
        (data.list || []).map((item: { name: any; id: any }) => ({
          label: item.name,
          value: item.id,
        })),
    })
    // 获取产品详情
    const [productInfo, setProductInfo] = useState<ProductInfo>()
    useEffect(() => {
      const value = form.getFieldsValue()
      if (value.conditions?.option.code && trigger === '设备数据触发') {
        console.log(11, value.conditions?.option.code)
        computCodeType(value.conditions?.option.code)
      }
    }, [productInfo])
    const loadProductInfo = useCallback(
      ({ productid }: { productid: string }) => {
        getProductInfo<ProductInfo>(productid).then((resp) => {
          if (resp.success) {
            setProductInfo(resp.result)
            // console.log('setProductInfo', record)
            // setTimeout(() => {
            //   if (record?.conditions?.[0]?.option.code) {
            //     computCodeType(record?.conditions?.[0]?.option.code)
            //   }
            // }, 0)
          }
        })
      },
      [],
    )
    // 触发条件产品选择
    const productChange = (value: string) => {
      loadProductInfo({ productid: value })
      devicesTypeApi.run({
        product_id: value,
      })
      const change = {
        decide_condition_1: undefined,
        decide_condition_2: undefined,
        conditions: {
          option: {
            device_id: undefined,
            code: undefined,
            value_type: undefined,
            value_cycle: undefined,
            decide_condition_bool: undefined,
            decide_condition_text: undefined,
            decide_condition_enum: undefined,
            status: undefined,
          },
        },
      }
      form.setFieldsValue(change)
      onValuesChange(change, form.getFieldsValue())
      console.log(1)
      setCodeType('')
    }

    // 执行动作产品选择
    const actionProductChange = (value: string, name: number) => {
      console.log(['actions', name, 'product_name'])
      loadProductInfo({ productid: value })
      devicesTypeApi.run({
        product_id: value,
      })
      // const change = {
      //   actions?.[name] : {
      //     device_id: undefined,
      //     code: undefined,
      //   },
      // }
      // form.setFieldsValue(change)
      // onValuesChange(change, form.getFieldsValue())
    }

    // 触发条件功能选择
    const codeChange = () => {
      const change = {
        decide_condition_1: undefined,
        decide_condition_2: undefined,
        conditions: {
          option: {
            value_type: undefined,
            value_cycle: undefined,
            decide_condition_bool: undefined,
            decide_condition_text: undefined,
            decide_condition_enum: undefined,
            // status: undefined,
          },
        },
      }
      form.setFieldsValue(change)
      onValuesChange(change, form.getFieldsValue())
    }

    // 执行动作功能选择
    const actionCodeChange = () => {
      const change = {
        // actions: {
        //   value: undefined,
        // },
      }
      form.setFieldsValue(change)
      onValuesChange(change, form.getFieldsValue())
    }

    const propertyOptions = useMemo(
      () =>
        (productInfo?.properties || [])
          .filter((item) =>
            ['int', 'float', 'bool', 'text', 'enum'].includes(
              item.type_spec.type,
            ),
          )
          .map(({ name: label, code: value, type_spec }) => ({
            label,
            value,
            type: type_spec.type,
          })),
      [productInfo?.properties],
    )
    console.log('propertyOptions', propertyOptions)

    const eventOptions = useMemo(
      () =>
        (productInfo?.events || []).map(({ name: label, code: value }) => ({
          label,
          value,
        })),
      [productInfo?.events],
    )

    const DeviceStatusOptions = [
      { label: '在线', value: '在线' },
      { label: '离线', value: '离线' },
    ]

    const computCodeType = useCallback(
      (codeType: string) => {
        const options = propertyOptions.find(({ value }) => value === codeType)
        console.log(2, codeType, propertyOptions, options?.type)
        options?.type ? setCodeType(options.type) : setCodeType('')
      },
      [propertyOptions],
    )

    useImperativeHandle(
      ref,
      () => {
        return {
          open (record) {
            setRecord(record)
            setIsModalOpen(true)
            if (record) {
              const value = {
                ...record,
                conditions: record.conditions[0],
                decide_condition_1: record.conditions[0].option.decide_condition?.split(' ')[0],
                decide_condition_2: record.conditions[0].option.decide_condition?.split(' ')[1],
              }
              loadProductInfo({
                productid: value.conditions.option.product_id,
              })
              devicesTypeApi.run({
                product_id: value.conditions.option.product_id,
              })
              form.setFieldsValue(value)
              onValuesChange(value, value)
              // if (record.conditions?.[0]?.option.code) {
              //   computCodeType(record.conditions?.[0]?.option.code)
              // }
            }
          },
        }
      },
      [form],
    )

    const computActionCodeType = useCallback(
      (index: number, codeType: string) => {
        const options = propertyOptions.find(({ value }) => value === codeType)
        console.log('ActionCodeType', index, options)
        if (options?.type) {
          actionCodeType[index] = options.type
          form.setFieldValue(['actions', index, 'data_type'], options.type)
        } else {
          // actionCodeType[index] = ''
        }
        setActionCodeType([...actionCodeType])
      },
      [propertyOptions],
    )

    // 触发方式选择
    const typeChange = () => {
      form.setFieldsValue({
        decide_condition_1: undefined,
        decide_condition_2: undefined,
        conditions: {
          option: {
            trigger: undefined,
            // product_id: undefined,
            // device_id: undefined,
            code: undefined,
            value_type: undefined,
            value_cycle: undefined,
            decide_condition_bool: undefined,
            decide_condition_text: undefined,
            decide_condition_enum: undefined,
            status: undefined,
            cron_expression: undefined,
          },
        },
      })
      console.log(3)
      setCodeType('')
    }
    // 触发方式选择
    const triggerChange = (value: string) => {
      setTrigger(value)
      form.setFieldsValue({
        decide_condition_1: undefined,
        decide_condition_2: undefined,
        conditions: {
          option: {
            // product_id: undefined,
            // device_id: undefined,
            code: undefined,
            value_type: undefined,
            value_cycle: undefined,
            decide_condition_bool: undefined,
            decide_condition_text: undefined,
            decide_condition_enum: undefined,
            status: undefined,
          },
        },
      })
      console.log(4)
      setCodeType('')
    }
    // 消息源类型选择
    // const typeChange = () => {
    //   form.setFieldsValue({
    //     decide_condition_1: undefined,
    //     decide_condition_2: undefined,s
    //     conditions: {
    //       option: {
    //         code: undefined,
    //         value_type: undefined,
    //         value_cycle: undefined,
    //         decide_condition_bool: undefined,
    //         decide_condition_text: undefined,
    //         decide_condition_enum: undefined,
    //         state: undefined,
    //       },
    //     },
    //   })
    // }

    const { onValuesChange, onDepsChangeRender } = useFormDependencies()

    const initialValues = useMemo(() => {
      if (!record?.conditions) {
        return {
          conditions: {
            condition_type: 'notify',
            optopn: {
              trigger: '设备数据触发',
            },
          },
        }
      }
      const init = {
        ...(record as any),
        // notify:
      }
      init.conditions = (record.conditions || []).map((item) => ({
        ...item,
        option: {
          ...item.option,
        },
      }))
      init.conditions.condition_type = init.conditions?.[0]?.condition_type || 'notify'
      // init.conditions.option.trigger = init.conditions?.[0]?.option.trigger || '设备数据触发'
      if (init.conditions?.[0]?.option.decide_condition) {
        init.decide_condition_1 = init.conditions[0].option.decide_condition.split(' ')[0]
        init.decide_condition_2 = init.conditions[0].option.decide_condition.split(' ')[1]
      }
      if (init.conditions?.[0]?.option.trigger) {
        setTrigger(init.conditions?.[0]?.option.trigger)
      }
      init.conditions = init.conditions?.[0]
      if (init.conditions) {
        const token = init.conditions?.option?.decide_condition?.slice(3, 4)
        if (token === '{') {
          init.conditions.option.decide_condition_text = init.conditions?.option?.decide_condition?.slice(4, -1)
        } else if (/\d/.test(token)) {
          init.conditions.option.decide_condition_enum = init.conditions?.option?.decide_condition?.slice(3)
        } else if (/t|f/.test(token)) {
          init.conditions.option.decide_condition_bool = init.conditions?.option?.decide_condition?.slice(3)
        }
      }
      if (Array.isArray(record?.actions)) {
        init.actions = record.actions.map((item) => ({
          type: '设备执行',
          select: '选择产品',
          ...item,
        }))
        init.actions.forEach((item: { data_type: string, }, index: number) => {
          if (item?.data_type) {
            actionCodeType[index] = item.data_type
          }
          setActionCodeType([...actionCodeType])
        })
      }
      console.log('init', init)
      form.setFieldsValue(init)
      onValuesChange(init, init)
      return init
    }, [record])

    return (
      <Drawer
        title="编辑场景"
        placement="right"
        open={isModalOpen}
        width={1000}
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
                form.validateFields().then((values) => {
                  console.log('values', values)
                  const params = {
                    id: record?.id,
                    ...values,
                    decide_condition_1: undefined,
                    decide_condition_2: undefined,
                  }
                  if (values.decide_condition_1 && values.decide_condition_2) {
                    params.conditions.option.decide_condition = `${values.decide_condition_1} ${values.decide_condition_2}`
                  }
                  if (values.conditions.option.decide_condition_bool) {
                    params.conditions.option.decide_condition = `== ${params.conditions.option.decide_condition_bool}`
                    params.conditions.option.decide_condition_bool = undefined
                  }
                  if (values.conditions.option.decide_condition_text) {
                    params.conditions.option.decide_condition = `== {${params.conditions.option.decide_condition_text}}`
                    params.conditions.option.decide_condition_text = undefined
                  }
                  if (values.conditions.option.decide_condition_enum) {
                    params.conditions.option.decide_condition = `== ${params.conditions.option.decide_condition_enum}`
                    params.conditions.option.decide_condition_enum = undefined
                  }
                  if (params.actions?.[0]?.type) {
                    params.actions[0].type = undefined
                  }
                  if (params.actions?.[0]?.select) {
                    params.actions[0].select = undefined
                  }
                  params.conditions = [params.conditions]
                  console.log('params', params)
                  // setSubmitting(true)
                  editScene(params)
                    .then((resp) => {
                      if (resp.success) {
                        message.success('编辑成功')
                        handleClose()
                        onFinish()
                      } else {
                        message.error(resp.errorMsg)
                      }
                    })
                    .finally(() => {
                      setSubmitting(false)
                    })
                })
              }}
            >
              确定
            </Button>
            <Button onClick={handleClose}>取消</Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onValuesChange={(changedValues, ...props) => {
            // console.log('onValuesChange = ', changedValues, ...props)
            onValuesChange(changedValues, ...props)
            if (changedValues?.conditions?.option?.code) {
              console.log(22)
              computCodeType(changedValues.conditions.option.code)
            }
            if (changedValues?.actions) {
              changedValues?.actions.forEach(
                (action: { code: string }, index: number) => {
                  action?.code && computActionCodeType(index, action.code)
                },
              )
            }
          }}
          initialValues={initialValues}
        >
          <Card
            title="触发条件"
            style={{ boxShadow: '0 0 6px 1px rgb(0 0 0 / 14%)' }}
          >
            <Row gutter={15}>
              <Col span={6}>
                <Form.Item
                  label="触发方式"
                  name={['conditions', 'condition_type']}
                  rules={[{ required: true, message: '不能为空' }]}
                >
                  <Select
                    placeholder="请选择"
                    onChange={typeChange}
                    options={[
                      { value: 'notify', label: '设备触发' },
                      { value: 'timer', label: '定时触发' },
                    ]}
                  />
                </Form.Item>
              </Col>
              {onDepsChangeRender(({ conditions }) =>
                conditions?.condition_type === 'notify'
                  ? (
                    <>
                      <Col span={6}>
                        <Form.Item
                          // label="触发方式"
                          name={['conditions', 'option', 'trigger']}
                          rules={[{ required: true, message: '不能为空' }]}
                        >
                          <Select
                            style={{ marginTop: '28px' }}
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
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="产品"
                          name={['conditions', 'option', 'product_id']}
                          rules={[{ required: true, message: '不能为空' }]}
                        >
                          <Select
                            placeholder="请选择"
                            // onChange={productChange}
                            onChange={(id) => {
                              productChange(id)
                              const item = productTypeApi.data.find(
                                (item: { value: string }) => item.value === id,
                              )
                              if (item) {
                                form.setFieldValue(
                                  ['conditions', 'option', 'product_name'],
                                  item.label,
                                )
                              }
                            }}
                            loading={productTypeApi.loading}
                            showSearch
                            onSearch={(search) =>
                              productTypeApi.run({ name: search })
                            }
                            allowClear
                            options={productTypeApi.data}
                          />
                        </Form.Item>
                        <Form.Item
                          name={['conditions', 'option', 'product_name']}
                          noStyle
                        />
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          label="设备"
                          name={['conditions', 'option', 'device_id']}
                          rules={[{ required: true, message: '不能为空' }]}
                        >
                          <Select
                            placeholder="请选择"
                            // onChange={deviceChange}
                            onChange={(id) => {
                              const item = devicesTypeApi.data.find(
                                (item: { value: string }) => item.value === id,
                              )
                              if (item) {
                                form.setFieldValue(
                                  ['conditions', 'option', 'device_name'],
                                  item.label,
                                )
                              }
                            }}
                            loading={devicesTypeApi.loading}
                            showSearch
                            onSearch={(search) =>
                              devicesTypeApi.run({ name: search })
                            }
                            allowClear
                            options={devicesTypeApi.data}
                          />
                        </Form.Item>
                        <Form.Item
                          name={['conditions', 'option', 'device_name']}
                          noStyle
                        />
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          key={
                            trigger === '设备数据触发'
                              ? '功能'
                              : trigger === '设备事件触发'
                                ? '事件'
                                : trigger === '设备状态触发'
                                  ? '设备状态'
                                  : ''
                          }
                          label={
                            trigger === '设备数据触发'
                              ? '功能'
                              : trigger === '设备事件触发'
                                ? '事件'
                                : trigger === '设备状态触发'
                                  ? '设备状态'
                                  : ''
                          }
                          name={
                            trigger === '设备状态触发'
                              ? ['conditions', 'option', 'status']
                              : ['conditions', 'option', 'code']
                          }
                          rules={[{ required: true, message: '不能为空' }]}
                        >
                          <Select
                            placeholder="请选择"
                            onChange={codeChange}
                            loading={productTypeApi.loading}

                            allowClear
                            options={
                              trigger === '设备数据触发'
                                ? propertyOptions
                                : trigger === '设备事件触发'
                                  ? eventOptions
                                  : trigger === '设备状态触发'
                                    ? DeviceStatusOptions
                                    : []
                            }
                          />
                        </Form.Item>
                      </Col>
                      {['int', 'float'].includes(codeType) && (
                        <>
                          <Col span={6}>
                            <Form.Item
                              label="取值类型"
                              name={['conditions', 'option', 'value_type']}
                              rules={[{ required: true, message: '不能为空' }]}
                            >
                              <Select
                                placeholder="选择取值类型"
                                allowClear
                                options={[
                                  { value: 'original', label: '原始值' },
                                  { value: 'avg', label: '平均值' },
                                  { value: 'max', label: '最大值' },
                                  { value: 'min', label: '最小值' },
                                  { value: 'mum', label: '求和值' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Form.Item
                              label="取值周期"
                              name={['conditions', 'option', 'value_cycle']}
                              rules={[{ required: true, message: '不能为空' }]}
                            >
                              <Select
                                placeholder="选择取值周期"
                                allowClear
                                options={[
                                  { value: '1分钟周期', label: '1分钟周期' },
                                  { value: '5分钟周期', label: '5分钟周期' },
                                  { value: '15分钟周期', label: '15分钟周期' },
                                  { value: '30分钟周期', label: '30分钟周期' },
                                  { value: '60分钟周期', label: '60分钟周期' },
                                ]}
                              />
                            </Form.Item>
                          </Col>
                          <Col span={6}>
                            <Row>
                              <Col span={10}>
                                <Form.Item
                                  label="判断条件"
                                  name="decide_condition_1"
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
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
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                              <Col span={14}>
                                <Form.Item
                                  label=""
                                  name="decide_condition_2"
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Input
                                    style={{ marginTop: '28px' }}
                                    allowClear
                                    placeholder="请输入"
                                  />
                                </Form.Item>
                              </Col>
                            </Row>
                          </Col>
                        </>
                      )}
                      {['bool'].includes(codeType) && (
                        <Col span={6}>
                          <Form.Item
                            label="判断条件"
                            name={[
                              'conditions',
                              'option',
                              'decide_condition_bool',
                            ]}
                            rules={[{ required: true, message: '不能为空' }]}
                          >
                            <Select
                              placeholder="请选择"
                              allowClear
                              options={[
                                { value: 'true', label: 'True' },
                                { value: 'false', label: 'False' },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      )}
                      {['text'].includes(codeType) && (
                        <Col span={6}>
                          <Form.Item
                            label="判断条件"
                            name={[
                              'conditions',
                              'option',
                              'decide_condition_text',
                            ]}
                            rules={[{ required: true, message: '不能为空' }]}
                          >
                            <Input placeholder="请输入"></Input>
                          </Form.Item>
                        </Col>
                      )}
                      {['enum'].includes(codeType) && (
                        <Col span={6}>
                          <Form.Item
                            label="判断条件"
                            name={[
                              'conditions',
                              'option',
                              'decide_condition_enum',
                            ]}
                            rules={[{ required: true, message: '不能为空' }]}
                          >
                            <Select
                              placeholder="请选择"
                              allowClear
                              options={[
                                { value: '0', label: '红' },
                                { value: '1', label: '绿' },
                                { value: '2', label: '蓝' },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                      )}
                    </>
                  )
                  : (
                    <>
                      <Col span={18}>
                        <Form.Item
                          name={['conditions', 'option', 'cron_expression']}
                          rules={[{ required: true, message: '不能为空' }]}
                        >
                          <SelectWeekDays style={{ marginTop: '28px' }} />
                        </Form.Item>
                      </Col>
                    </>
                  ),
              )}
            </Row>
          </Card>
          <Card
            title="执行动作"
            className="mt20"
            style={{ boxShadow: '0 0 6px 1px rgb(0 0 0 / 14%)' }}
          >
            <Form.List name="actions">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ name, ...restField }) => (
                    <div key={name}>
                      <div className="mb10">
                        动作{name + 1}
                        <MinusCircleOutlined
                          onClick={() => remove(name)}
                          style={{ float: 'right' }}
                        />
                      </div>
                      <Row gutter={15}>
                        <Col span={6}>
                          <Form.Item
                            {...restField}
                            name={[name, 'type']}
                            rules={[{ required: true, message: '不能为空' }]}
                          >
                            <Select
                              placeholder="选择动作类型"
                              // onChange={}
                              options={[
                                { value: '设备执行', label: '设备执行' },
                              ]}
                            />
                          </Form.Item>
                        </Col>
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.type === '设备执行'
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'select']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Select
                                    placeholder="选择产品/分组"
                                    options={[
                                      { value: '选择产品', label: '选择产品' },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.select === '选择产品'
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'product_id']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Select
                                    placeholder="选择产品"
                                    onChange={(id) => {
                                      actionProductChange(id, name)
                                      const item = productTypeApi.data.find(
                                        (item: { value: string }) =>
                                          item.value === id,
                                      )
                                      if (item) {
                                        form.setFieldValue(
                                          ['actions', name, 'product_name'],
                                          item.label,
                                        )
                                      }
                                    }}
                                    loading={productTypeApi.loading}
                                    showSearch
                                    onSearch={(search) =>
                                      productTypeApi.run({ name: search })
                                    }
                                    allowClear
                                    options={productTypeApi.data}
                                  />
                                </Form.Item>
                                <Form.Item
                                  name={[name, 'product_name']}
                                  noStyle
                                />
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.product_id
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'device_id']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  {/* <Select
                                    placeholder="选择设备"
                                    onChange={(id) => {
                                      const item = devicesTypeApi.data.find(
                                        (item: { value: string }) =>
                                          item.value === id,
                                      )
                                      if (item) {
                                        form.setFieldValue(
                                          ['actions', name, 'device_name'],
                                          item.label,
                                        )
                                      }
                                    }}
                                    loading={devicesTypeApi.loading}
                                    showSearch
                                    onSearch={(search) =>
                                      devicesTypeApi.run({ name: search })
                                    }
                                    allowClear
                                    options={devicesTypeApi.data}
                                  /> */}
                                  <RequestSelect
                                    placeholder="选择设备"
                                    api={getDevice}
                                    params={{ product_id: actions?.[name]?.product_id }}
                                    formatData={(data) => (data.list || []).map((item: { name: any; id: any }) => ({
                                      label: item.name,
                                      value: item.id,
                                    }))}
                                    onChange={(id: any, _: any, options) => {
                                      const item = options.find((item: { value: string }) => item.value === id)
                                      if (item) {
                                        form.setFieldValue(
                                          ['actions', name, 'device_name'],
                                          item.label,
                                        )
                                      }
                                    }}
                                    // loading={devicesTypeApi.loading}
                                    showSearch
                                    onSearch={(name, preParams) => ({ ...preParams, name })}
                                    allowClear
                                    // options={devicesTypeApi.data}
                                  />
                                </Form.Item>
                                <Form.Item name={[name, 'device_name']} noStyle />
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.device_id
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'code']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  {/* <Select
                                    placeholder="选择功能"
                                    onChange={actionCodeChange}
                                    loading={productTypeApi.loading}
                                    showSearch
                                    allowClear
                                    options={propertyOptions}
                                  /> */}
                                  <RequestSelect
                                    placeholder="选择功能"
                                    api={getProductInfo}
                                    params={actions?.[name]?.product_id}
                                    formatData={(productInfo) => (productInfo?.properties || [])
                                      .filter((item: { type_spec: { type: string } }) =>
                                        ['int', 'float', 'bool', 'text', 'enum'].includes(
                                          item.type_spec.type,
                                        ),
                                      )
                                      .map(({ name: label, code: value, type_spec }: any) => ({
                                        label,
                                        value,
                                        type: type_spec.type,
                                      }))}
                                    onChange={actionCodeChange}
                                    // loading={devicesTypeApi.loading}
                                    // showSearch
                                    // onSearch={(name, preParams) => ({ ...preParams, name })}
                                    // allowClear
                                    // options={devicesTypeApi.data}
                                  />
                                </Form.Item>
                                <Form.Item name={[name, 'data_type']} noStyle />
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {actionCodeType[name]} hh {codeType}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.code
                          && ['int', 'float', 'text'].includes(
                            actionCodeType[name],
                          )
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Input allowClear placeholder="数值：" />
                                </Form.Item>
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.code
                          && ['bool'].includes(actionCodeType[name])
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Select
                                    placeholder="请选择"
                                    allowClear
                                    options={[
                                      { value: 'true', label: 'True' },
                                      { value: 'false', label: 'False' },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                        {onDepsChangeRender(({ actions }) =>
                          actions?.[name]?.code
                          && ['enum'].includes(actionCodeType[name])
                            ? (
                              <Col span={6}>
                                <Form.Item
                                  {...restField}
                                  name={[name, 'value']}
                                  rules={[
                                    { required: true, message: '不能为空' },
                                  ]}
                                >
                                  <Select
                                    placeholder="请选择"
                                    allowClear
                                    options={[
                                      { value: '0', label: '红' },
                                      { value: '1', label: '绿' },
                                      { value: '2', label: '蓝' },
                                    ]}
                                  />
                                </Form.Item>
                              </Col>
                            )
                            : (
                              ''
                            ),
                        )}
                      </Row>
                    </div>
                  ))}
                  {fields.length <= 4 && (
                    <Form.Item>
                      <Button
                        type="dashed"
                        style={{ width: '100px' }}
                        onClick={() => add({ type: '设备执行' })}
                        block
                        icon={<PlusOutlined />}
                      >
                        添加
                      </Button>
                    </Form.Item>
                  )}
                </>
              )}
            </Form.List>
          </Card>
        </Form>
      </Drawer>
    )
  },
)

export default EditScene
