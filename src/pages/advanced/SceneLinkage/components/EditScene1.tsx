import React, { useEffect, useRef, useState } from 'react'
import { DrawerForm, ProFormDependency, ProFormInstance, ProFormList, ProFormSelect, ProFormText } from '@ant-design/pro-components'
import { Col, Form, Row, Spin, message } from 'antd'
import { SceneData, editScene, getDevice, getProductInfo, getProductList } from '@/api'
import { ProductInfo } from '@/pages/gateway/ProductManage/types'
import SelectWeekDays from './SelectWeekDays'
import { MinusCircleOutlined } from '@ant-design/icons'

interface IEditScene {
  record: SceneData
  onClose: () => void
  onFinish: () => void
}

export default function EditScene ({
  record,
  onClose,
  onFinish,
}: IEditScene) {
  const [initing, setIniting] = useState(false)
  const [enumOptions, setEnumOptions] = useState<{
    value: string;
    label: string;
  }[]>([])
  const [listEnumOptions, setListEnumOptions] = useState<{
    value: string;
    label: string;
  }[][]>([])

  useEffect(() => {
    const conditions = record?.conditions?.[0]
    let decide_condition_1, decide_condition_2
    if (conditions?.option?.decide_condition?.startsWith('= ') && !['int', 'float'].includes(conditions?.option?.type)) {
      conditions.option.decide_condition = conditions.option.decide_condition.slice(2)
    } else {
      const condition = conditions?.option?.decide_condition?.split(' ') || []
      decide_condition_1 = condition[0]
      decide_condition_2 = condition[1]
    }
    const actions = (record?.actions || []).map((action) => ({ ...action, type: '设备执行' }))
    formRef.current?.setFieldsValue({
      ...record,
      conditions,
      decide_condition_1,
      decide_condition_2,
      actions,
    })
    setIniting(true)
    Promise.all([
      conditions?.option?.product_id && getProductInfo<ProductInfo>(conditions.option.product_id).then((resp) => {
        if (resp.success) {
          const prop = (resp.result?.properties || []).find((prop) => prop.code === conditions.option.code)
          formRef.current?.setFieldValue(['conditions', 'option', 'type'], prop?.type_spec.type)

          let specs: { value: string; label: string }[]
          try {
            const obj = JSON.parse(prop?.type_spec?.specs || '{}')
            specs = Object.entries(obj).map(([value, label]) => ({ value, label: label as string }))
          } catch (error) {
            console.error(error, prop?.type_spec?.specs)
            specs = []
          }
          setEnumOptions(specs)
        }
      }),
      ...(record?.actions || []).map((action: { code: string; product_id: string }, index: number) => {
        return getProductInfo<ProductInfo>(action.product_id).then((resp) => {
          if (resp.success) {
            const prop = (resp.result?.properties || []).find((prop) => prop.code === action.code)
            formRef.current?.setFieldValue(['actions', index, 'data_type'], prop?.type_spec.type)

            let specs: { value: string; label: string }[]
            try {
              const obj = JSON.parse(prop?.type_spec?.specs || '{}')
              specs = Object.entries(obj).map(([value, label]) => ({ value, label: label as string }))
            } catch (error) {
              console.error(error, prop?.type_spec?.specs)
              specs = []
            }
            listEnumOptions[index] = specs
            setListEnumOptions([...listEnumOptions])
          }
        })
      }),
    ]).finally(() => {
      setIniting(false)
    })
  }, [])

  const formRef = useRef<ProFormInstance>()

  console.log('formRef', formRef)

  return (<DrawerForm
    open={!!record}
    title="编辑场景"
    // trigger={children}
    // drawerProps={{
    //   placement: 'right',
    // }}
    loading={initing}
    formRef={formRef}
    initialValues={{
      conditions: {
        condition_type: 'notify',
        option: {
          trigger: '设备数据触发',
        },
      },
    }}
    onOpenChange={(v) => v || onClose()}
    onFinish={async (fields) => {
      try {
        console.log('onFinish', fields)
        const decide_condition = fields.decide_condition_1 && fields.decide_condition_2
          ? `${fields.decide_condition_1} ${fields.decide_condition_2}`
          : `= ${fields.conditions.option.decide_condition}`
        const params = {
          ...fields,
          id: record.id,
          decide_condition_1: undefined,
          decide_condition_2: undefined,
          conditions: [{
            ...fields.conditions,
            option: {
              ...fields.conditions.option,
              // code_type: undefined,
              decide_condition,
            },
          }],
          actions: fields.actions.map((actions: any) => ({ ...actions, type: undefined })),
        }
        const resp = await editScene(params)
        if (resp.success) {
          message.success('编辑成功')
          // handleClose()
          onFinish()
          onClose()
          return true
        }
        message.error(resp.errorMsg)
        // setSubmitting(false)
        return false
      } catch (error) {
        console.log(error)
      }
    }}
    drawerProps={{
      width: 850,
    }}
  >
    <Spin spinning={initing}>
      <div
        style={{ boxShadow: '0 0 6px 1px rgb(0 0 0 / 14%)', padding: '20px', borderRadius: '5px' }}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>触发条件</div>
        <Row gutter={15}>
          <Col span={6}>
            <ProFormSelect
              label="触发方式"
              name={['conditions', 'condition_type']}
              placeholder="选择触发方式"
              options={[
                { value: 'notify', label: '设备触发' },
                { value: 'timer', label: '定时触发' },
              ]}
              rules={[{ required: true, message: '不能为空' }]}
              fieldProps={{
                onChange () {
                  formRef.current?.setFieldValue(['conditions', 'option', 'trigger'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'product_id'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'device_id'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'code'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'status'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'type'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'value_type'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'value_cycle'], undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'decide_condition'], undefined)
                  formRef.current?.setFieldValue('decide_condition_1', undefined)
                  formRef.current?.setFieldValue('decide_condition_2', undefined)
                  formRef.current?.setFieldValue(['conditions', 'option', 'cron_expression'], undefined)
                },
              }}
            />
          </Col>
          <ProFormDependency name={['conditions', 'condition_type']}>
            {(record) => {
              if (record?.conditions?.condition_type === 'notify') {
                return (<>
                  <Col span={6}>
                    <ProFormSelect
                      label=" "
                      required={false}
                      name={['conditions', 'option', 'trigger']}
                      rules={[{ required: true, message: '不能为空' }]}
                      options={[
                        { value: '设备数据触发', label: '设备数据触发' },
                        { value: '设备事件触发', label: '设备事件触发' },
                        { value: '设备状态触发', label: '设备状态触发' },
                      ]}
                      fieldProps={{
                        onChange () {
                          formRef.current?.setFieldValue(['conditions', 'option', 'code'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'status'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'type'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'value_type'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'value_cycle'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'decide_condition'], undefined)
                          formRef.current?.setFieldValue('decide_condition_1', undefined)
                          formRef.current?.setFieldValue('decide_condition_2', undefined)
                        },
                      }} />
                  </Col>
                  <Col span={6}>
                    <ProFormSelect
                      label="产品"
                      name={['conditions', 'option', 'product_id']}
                      rules={[{ required: true, message: '不能为空' }]}
                      showSearch
                      placeholder="选择产品"
                      request={async ({ keyWords }) => {
                        const res: any = await getProductList({ name: keyWords } as any)
                        console.log(res)
                        const options = (res.result.list || []).map((item: { name: any; id: any}) => ({
                          label: item.name,
                          value: item.id,
                        }))
                        return options
                      } }
                      fieldProps={{
                        onChange (_key, option) {
                          formRef.current?.setFieldValue(['conditions', 'option', 'device_id'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'code'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'status'], undefined)
                          formRef.current?.setFieldValue(
                            ['conditions', 'option', 'product_name'],
                            (option as { label: string})?.label,
                          )
                          formRef.current?.setFieldValue(['conditions', 'option', 'type'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'value_type'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'value_cycle'], undefined)
                          formRef.current?.setFieldValue(['conditions', 'option', 'decide_condition'], undefined)
                          formRef.current?.setFieldValue('decide_condition_1', undefined)
                          formRef.current?.setFieldValue('decide_condition_2', undefined)
                        },
                      }} />
                    <Form.Item
                      name={['conditions', 'option', 'product_name']}
                      noStyle />
                  </Col>
                  <ProFormDependency name={['conditions', 'option', 'product_id']}>
                    {(record) => (record?.conditions?.option?.product_id
                      && <Col span={6}>
                        <ProFormSelect
                          key={record.conditions.option.product_id}
                          rules={[{ required: true, message: '不能为空' }]}
                          label="设备"
                          name={['conditions', 'option', 'device_id']}
                          placeholder="选择设备"
                          showSearch
                          request={async ({ keyWords }) => {
                            const res = await getDevice({
                              product_id: record.conditions.option.product_id,
                              name: keyWords,
                            })
                            return (res.result.list || []).map((item: { name: any; id: any}) => ({
                              label: item.name,
                              value: item.id,
                            }))
                          } }
                          fieldProps={{
                            onChange (_key, option) {
                              formRef.current?.setFieldValue(
                                ['conditions', 'option', 'device_name'],
                                (option as { label: string})?.label,
                              )
                            },
                          }} />
                        <Form.Item
                          name={['conditions', 'option', 'device_name']}
                          noStyle />
                      </Col>
                    )}
                  </ProFormDependency><>
                    <ProFormDependency name={['conditions', 'option', ['trigger', 'product_id']]}>
                      {(record) => {
                        console.log('设备数据触发', record)
                        if (record?.conditions?.option?.trigger === '设备数据触发' && record?.conditions?.option?.product_id) {
                          return (<Col span={6}>
                            <ProFormSelect
                              key={record.conditions.option.product_id}
                              rules={[{ required: true, message: '不能为空' }]}
                              label="功能"
                              name={['conditions', 'option', 'code']}
                              placeholder="选择功能"
                              request={async () => {
                                const res = await getProductInfo<ProductInfo>(record.conditions.option.product_id)
                                return (res.result?.properties || [])
                                  .filter((item) => ['int', 'float', 'bool', 'text', 'enum'].includes(
                                    item.type_spec.type,
                                  ),
                                  )
                                  .map(({ name: label, code: value, type_spec }) => {
                                    let specs: { value: string; label: string }[]
                                    try {
                                      const obj = JSON.parse(type_spec.specs)
                                      specs = Object.entries(obj).map(([value, label]) => ({ value, label: label as string }))
                                    } catch (error) {
                                      console.error(error, type_spec.specs)
                                      specs = []
                                    }
                                    return {
                                      label,
                                      value,
                                      type: type_spec.type,
                                      specs,
                                    }
                                  })
                              } }
                              fieldProps={{
                                onChange (_key, option) {
                                  console.log('onChange', _key, option)
                                  setEnumOptions((option as any).specs)
                                  formRef.current?.setFieldValue(
                                    ['conditions', 'option', 'type'],
                                    (option as unknown as { type: string})?.type,
                                  )
                                  formRef.current?.setFieldValue(['conditions', 'option', 'value_type'], undefined)
                                  formRef.current?.setFieldValue(['conditions', 'option', 'value_cycle'], undefined)
                                  formRef.current?.setFieldValue(['conditions', 'option', 'decide_condition'], undefined)
                                  formRef.current?.setFieldValue('decide_condition_1', undefined)
                                  formRef.current?.setFieldValue('decide_condition_2', undefined)
                                },
                              }} />
                            <Form.Item
                              name={['conditions', 'option', 'type']}
                              noStyle />
                          </Col>)
                        }
                      } }
                    </ProFormDependency>
                    <ProFormDependency name={['conditions', 'option', ['trigger', 'product_id']]}>
                      {(record) => {
                        console.log('设备事件触发', record)
                        if (record?.conditions?.option?.trigger === '设备事件触发' && record?.conditions?.option?.product_id) {
                          return (<Col span={6}><ProFormSelect
                            key={record.conditions.option.product_id}
                            rules={[{ required: true, message: '不能为空' }]}
                            label="事件"
                            name={['conditions', 'option', 'code']}
                            placeholder="请选择"
                            request={async () => {
                              const res = await getProductInfo<ProductInfo>(record.conditions.option.product_id)
                              return (res.result?.events || []).map(({ name: label, code: value }) => ({
                                label,
                                value,
                              }))
                            } } />
                          </Col>)
                        }
                      } }
                    </ProFormDependency>
                    <ProFormDependency name={['conditions', 'option', ['trigger', 'product_id']]}>
                      {(record) => {
                        console.log('设备状态触发', record)
                        if (record?.conditions?.option?.trigger === '设备状态触发' && record?.conditions?.option?.product_id) {
                          return (<Col span={6}><ProFormSelect
                            rules={[{ required: true, message: '不能为空' }]}
                            label="设备状态"
                            name={['conditions', 'option', 'status']}
                            placeholder="请选择"
                            options={[
                              { label: '在线', value: '在线' },
                              { label: '离线', value: '离线' },
                            ]} />
                          </Col>)
                        }
                      } }
                    </ProFormDependency>
                  </>
                  <>
                    <ProFormDependency name={['conditions', 'option', ['type', 'code']]}>
                      {(record) => {
                        console.log('取值类型', record)
                        if (['int', 'float'].includes(record?.conditions?.option?.type)) {
                          return (<>
                            <Col span={6}><ProFormSelect
                              label="取值类型"
                              name={['conditions', 'option', 'value_type']}
                              rules={[{ required: true, message: '不能为空' }]}
                              placeholder="请选择"
                              options={[
                                { value: 'original', label: '原始值' },
                                { value: 'avg', label: '平均值' },
                                { value: 'max', label: '最大值' },
                                { value: 'min', label: '最小值' },
                                { value: 'sum', label: '求和值' },
                              ]} />
                            </Col>
                            <Form.Item
                              noStyle
                              shouldUpdate={(prevValues, nextValues) => {
                                return prevValues?.conditions?.option?.value_type !== nextValues?.conditions?.option?.value_type
                              }}
                            >
                              {({ getFieldValue }) => {
                                return getFieldValue(['conditions', 'option', 'value_type']) !== 'original' && (<Col span={6}>
                                  <ProFormSelect
                                    label="取值周期"
                                    name={['conditions', 'option', 'value_cycle']}
                                    placeholder="请选择"
                                    rules={[{ required: true, message: '不能为空' }]}
                                    options={[
                                      { value: '1分钟周期', label: '1分钟周期' },
                                      { value: '5分钟周期', label: '5分钟周期' },
                                      { value: '15分钟周期', label: '15分钟周期' },
                                      { value: '30分钟周期', label: '30分钟周期' },
                                      { value: '60分钟周期', label: '60分钟周期' },
                                    ]} />
                                </Col>)
                              }}
                            </Form.Item>
                            <Col span={6}>
                              <Row>
                                <Col flex="70px">
                                  <ProFormSelect
                                    label="判断条件"
                                    name="decide_condition_1"
                                    width={80}
                                    rules={[{ required: true, message: '不能为空' }]}
                                    options={[
                                      { value: '>', label: '>' },
                                      { value: '<', label: '<' },
                                      { value: '=', label: '=' },
                                      { value: '>=', label: '>=' },
                                      { value: '<=', label: '<=' },
                                      { value: '!=', label: '!=' },
                                    ]}
                                  />
                                </Col>
                                <Col flex="auto"><ProFormText
                                  label=" "
                                  required={false}
                                  name="decide_condition_2"
                                  rules={[{ required: true, message: '不能为空' }]}
                                  allowClear
                                  width={90}
                                  placeholder="请输入" />
                                </Col>
                              </Row>
                            </Col>
                          </>)
                        }
                        if (['bool'].includes(record?.conditions?.option?.type)) {
                          return (<>
                            <Col span={6}><ProFormSelect
                              rules={[{ required: true, message: '不能为空' }]}
                              label="判断条件"
                              name={['conditions', 'option', 'decide_condition']}
                              placeholder="请选择"
                              options={[
                                { value: 'true', label: 'True' },
                                { value: 'false', label: 'False' },
                              ]} />
                            </Col>
                          </>)
                        }
                        if (['text'].includes(record?.conditions?.option?.type)) {
                          return (<>
                            <Col span={6}><ProFormText
                              rules={[{ required: true, message: '不能为空' }]}
                              label="判断条件"
                              name={['conditions', 'option', 'decide_condition']}
                              allowClear
                              placeholder="请输入" />
                            </Col>
                          </>)
                        }
                        if (['enum'].includes(record?.conditions?.option?.type)) {
                          return (<>
                            <Col span={6}><ProFormSelect
                              rules={[{ required: true, message: '不能为空' }]}
                              label="判断条件"
                              name={['conditions', 'option', 'decide_condition']}
                              placeholder="请选择"
                              options={enumOptions}
                              // options={[
                              //   { value: '0', label: '红' },
                              //   { value: '1', label: '绿' },
                              //   { value: '2', label: '蓝' },
                              // ]}
                            />
                            </Col>
                          </>)
                        }
                      } }
                    </ProFormDependency>
                  </>
                </>)
              }
              if (record?.conditions?.condition_type === 'timer') {
                return (<>
                  <Col span={18}>
                    <Form.Item
                      name={['conditions', 'option', 'cron_expression']}
                      rules={[{ required: true, message: '不能为空' }]}
                    >
                      <SelectWeekDays style={{ marginTop: '28px' }} />
                    </Form.Item>
                  </Col>
                </>)
              }
            }}
          </ProFormDependency>
        </Row>
      </div>
      <div
        // title="执行动作"
        className="mt20"
        style={{ boxShadow: '0 0 6px 1px rgb(0 0 0 / 14%)', padding: '20px', borderRadius: '5px' }}
        // loading={initing}
      >
        <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 20 }}>执行动作</div>
        <ProFormList
          name="actions"
          deleteIconProps={{
            Icon: MinusCircleOutlined,
          }}
          copyIconProps={false}
          creatorButtonProps={{
            creatorButtonText: '添加',
          }}
          creatorRecord={{
            type: '设备执行',
          }}
          onAfterRemove={(...params: [...unknown[], number]) => {
            const [removes, count] = params
            console.log(removes, count)
            const list = listEnumOptions.filter((option, index) => removes as number !== index)
            setListEnumOptions(list)
          }}
          max={4}
          itemRender={(doms, listMeta) => {
            console.log('itemRender', doms, listMeta)
            return (<Row>
              <Col flex="auto">{doms.listDom}</Col>
              <Col flex="30px">{doms.action}</Col>
            </Row>)
          }}
          rowProps={{
            gutter: 15,
          }}
        >
          {(f, index, action) => {
            console.log(f, index, action)
            return (<div>
              <div className="mb10">
                动作{index + 1}
              </div>
              <Row gutter={15}>
                <Col span={6}>
                  <ProFormSelect
                    name="type"
                    placeholder="选择动作类型"
                    colProps={{ span: 16 }}
                    options={[
                      { value: '设备执行', label: '设备执行' },
                    ]}
                    rules={[{ required: true, message: '不能为空' }]}
                  />
                </Col>
                <ProFormDependency name={['actions', 'type']}>
                  {(record) => {
                    return (record?.type
                      && <Col span={6}>
                        <ProFormSelect
                          colProps={{ span: 6 }}
                          name={['product_id']}
                          placeholder="选择产品"
                          rules={[{ required: true, message: '不能为空' }]}
                          showSearch
                          request={async ({ keyWords }) => {
                            const res: any = await getProductList({ name: keyWords } as any)
                            console.log(res)
                            const options = (res.result.list || []).map((item: { name: any; id: any}) => ({
                              label: item.name,
                              value: item.id,
                            }))
                            return options
                          } }
                          fieldProps={{
                            onChange (_key, option) {
                              formRef.current?.setFieldValue(['actions', index, 'device_id'], undefined)
                              formRef.current?.setFieldValue(['actions', index, 'code'], undefined)
                              formRef.current?.setFieldValue(['actions', index, 'data_type'], undefined)
                              formRef.current?.setFieldValue(['actions', index, 'value'], undefined)
                              formRef.current?.setFieldValue(
                                ['actions', index, 'product_name'],
                                (option as { label: string})?.label,
                              )
                            },
                          }}
                        />
                        <Form.Item
                          name={['product_name']}
                          noStyle />
                      </Col>
                    )
                  }}
                </ProFormDependency>
                <ProFormDependency name={['actions', 'product_id']}>
                  {(record) => {
                    return (record?.product_id
                    && <Col span={6} key={`${index}_${record.product_id}`}>
                      <ProFormSelect
                        colProps={{ span: 6 }}
                        rules={[{ required: true, message: '不能为空' }]}
                        key={`${index}_${record.product_id}`}
                        name={['device_id']}
                        placeholder="选择设备"
                        showSearch
                        params={{
                          product_id: record.product_id,
                        }}
                        request={async ({ keyWords }) => {
                          const res = await getDevice({
                            product_id: record.product_id,
                            name: keyWords,
                          })
                          return (res.result.list || []).map((item: { name: any; id: any}) => ({
                            label: item.name,
                            value: item.id,
                          }))
                        } }
                        fieldProps={{
                          onChange (_key, option) {
                            formRef.current?.setFieldValue(
                              ['actions', index, 'device_name'],
                              (option as { label: string})?.label,
                            )
                          },
                        }} />
                      <Form.Item
                        name={['device_name']}
                        noStyle />
                    </Col>
                    )
                  }}
                </ProFormDependency>
                <ProFormDependency name={['device_id', 'product_id']}>
                  {(record) => {
                    return (record?.device_id
                    && <Col span={6}>
                      <ProFormSelect
                        rules={[{ required: true, message: '不能为空' }]}
                        name={['code']}
                        placeholder="选择功能"
                        params={record.product_id}
                        request={async () => {
                          const res = await getProductInfo<ProductInfo>(record.product_id)
                          return (res.result?.properties || [])
                            .filter((item) => ['int', 'float', 'bool', 'text', 'enum'].includes(
                              item.type_spec.type,
                            ),
                            )
                            .map(({ name: label, code: value, type_spec }) => {
                              let specs: { value: string; label: string }[]
                              try {
                                const obj = JSON.parse(type_spec.specs)
                                specs = Object.entries(obj).map(([value, label]) => ({ value, label: label as string }))
                              } catch (error) {
                                console.error(error, type_spec.specs)
                                specs = []
                              }
                              return {
                                label,
                                value,
                                type: type_spec.type,
                                specs,
                              }
                            })
                        } }
                        fieldProps={{
                          onChange (_key, option) {
                            listEnumOptions[index] = (option as any).specs
                            setListEnumOptions([...listEnumOptions])
                            formRef.current?.setFieldValue(
                              ['actions', index, 'data_type'],
                              (option as unknown as { type: string})?.type,
                            )
                            formRef.current?.setFieldValue(['actions', index, 'value'], undefined)
                          },
                        }} />
                      <Form.Item
                        name={['data_type']}
                        noStyle />
                    </Col>
                    )
                  }}
                </ProFormDependency>
                <ProFormDependency name={['actions', 'data_type']}>
                  {(record) => {
                    if (['int', 'float', 'text'].includes(record?.data_type)) {
                      return (<>
                        <Col span={6}>
                          <ProFormText
                            rules={[{ required: true, message: '不能为空' }]}
                            name={['value']}
                            allowClear
                            placeholder="数值：" />
                        </Col>
                      </>)
                    }
                    if (['bool'].includes(record?.data_type)) {
                      return (<>
                        <Col span={6}>
                          <ProFormSelect
                            rules={[{ required: true, message: '不能为空' }]}
                            name={['value']}
                            placeholder="请选择"
                            options={[
                              { value: 'true', label: 'True' },
                              { value: 'false', label: 'False' },
                            ]}
                          />
                        </Col>
                      </>)
                    }
                    if (['enum'].includes(record?.data_type)) {
                      return (<>
                        <Col span={6}>
                          <ProFormSelect
                            rules={[{ required: true, message: '不能为空' }]}
                            name={['value']}
                            placeholder="请选择"
                            options={listEnumOptions[index]}
                            // options={[
                            //   { value: '0', label: '红' },
                            //   { value: '1', label: '绿' },
                            //   { value: '2', label: '蓝' },
                            // ]}
                          />
                        </Col>
                      </>)
                    }
                  }}
                </ProFormDependency>
              </Row>
            </div>
            )
          }}
        </ProFormList>
      </div>
    </Spin>
  </DrawerForm>)
}
