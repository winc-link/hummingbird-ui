import { Button, Drawer, Form, Input, message, Radio, RadioChangeEvent, Select, Space, Steps, Tooltip } from 'antd'
import { CloseOutlined, QuestionCircleTwoTone, ExclamationCircleFilled } from '@ant-design/icons'
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useState } from 'react'
import { addRuleEngine, editRuleEngine, getDataResource, getRuleEngineInfo, getTypeResource } from '@/api'
import useRequest from '@/hooks/useRequest'
import { useNavigate } from 'react-router-dom'
import useFormDependencies, { NSuseFormDependencies } from '@/hooks/useFormDependencies'
import CodeHighlighter from '@/components/CodeHighlighter/CodeHighlighter'
import _ from 'lodash'

const { useForm } = Form
const { TextArea } = Input

export interface AddDirectRuleProps {
  onFinish: () => void
}
export interface AddDirectRuleRef {
  // open: (record?: ruleEngine) => void
  open: (id?: string) => void
}

export const AddDirectRule = forwardRef<AddDirectRuleRef, AddDirectRuleProps>(({ onFinish }, ref) => {
  const [form] = useForm()
  const navigate = useNavigate()
  const [recordId, setRecordId] = useState<string>()
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const getRuleEngineInfoApi = useRequest(getRuleEngineInfo, { manual: true })

  const handleClose = useCallback(() => {
    form.resetFields()
    setIsModalOpen(false)
  }, [form])

  useImperativeHandle(ref, () => {
    return {
      async open (id?: string) {
        setRecordId(id)
        setIsModalOpen(true)
        if (id) {
          const res = await getRuleEngineInfoApi.run(id)
          const change = {
            ...res,
            resource_type: res.dataResource.type,
          }
          form.setFieldsValue(change)
          onValuesChange(change, change)
          setCurrent(2)
        } else {
          onValuesChange({}, {})
        }
      },
    }
  }, [form])

  const [current, setCurrent] = useState(0)

  const valuesChange = useCallback((changedValues: NSuseFormDependencies.IAllValues, allValues: NSuseFormDependencies.IAllValues) => {
    // console.log('onChange:', changedValues, allValues)
    let current = 0
    if (allValues.name) {
      current = 1
      setSql(allValues.filter)
    }
    if (allValues.name && allValues.filter?.product_id && allValues.filter?.message_source && allValues.filter?.select_name) {
      current = 2
    }
    setCurrent(current)
    console.log(changedValues.resource_type)
    if (changedValues.resource_type) {
      dataResourceApi.run({ type: changedValues.resource_type })
    }
  }, [])

  // 获取产品接口
  // const productTypeApi = useRequest(getProductList, {
  //   manual: false,
  //   formatData: (data) => (data.list || []).map((item: { name: any; id: any }) => ({ label: item.name, value: item.id })),
  // })

  // 获取资源
  const dataResourceApi = useRequest(getDataResource, {
    manual: true,
    formatData: (data) => (data.list || []).filter((item: { health: boolean }) => item.health).map((item: { name: any; id: any; }) => ({ label: item.name, value: item.id })),
  })

  // 获取实例类型
  const typeResource = useRequest(getTypeResource, {
    onSuccess: (data) => {
      form.setFieldValue('method', data[0])
      dataResourceApi.run({ type: data[0] })
    },
  })

  const [value, setValue] = useState('')
  const onChangeMethod = (e: RadioChangeEvent) => {
    setValue(e.target.value)
    form.setFieldsValue({
      data_resource_id: undefined,
    })
  }

  const { onValuesChange, onDepsChangeRender } = useFormDependencies(valuesChange)

  const setSql = useCallback(_.debounce(({ select_name = '*', condition }: { select_name?: string, condition?: string } = {}) => {
    const textLst = ['SELECT', select_name, 'FROM', 'mqtt_stream']
    if (condition) textLst.push('where', condition)
    const sql = textLst.join(' ')
    form.setFieldValue(['filter', 'sql'], sql)
  }, 500), [])

  const step = useMemo(() => [
    {
      title: '基本信息',
      description: <>
        <Form.Item
          label="规则名称"
          name="name"
          rules={[
            {
              required: true,
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
          <Input placeholder="请输入规则名称"></Input>
        </Form.Item>
        <Form.Item
          label="规则描述"
          name="description"
        >
          <TextArea
            showCount
            maxLength={100}
            placeholder="请输入规则描述"
            rows={4}></TextArea>
        </Form.Item>
      </>,
    },
    {
      title: <span>
        条件过滤
        <Tooltip
          className="ml10"
          placement="rightTop"
          title="平台提供不同类型数据的消息源，您可完成简单的业务设置。您还可以直接编辑过滤语句，实现更复杂的查询要求。 "
        >
          <QuestionCircleTwoTone />
        </Tooltip>
      </span>,
      subTitle: '（SELECT [查询字段] FROM [消息源] WHERE [条件]），多个筛选项之间取交集',
      description: <>
        {onDepsChangeRender(({ name }) => name && <div>
          <div
            className="mt10 mb10"
            style={{ height: '40px', background: '#fceeca', display: 'flex', alignItems: 'center', border: '1px solid #ebb830' }}
          >
            <ExclamationCircleFilled style={{ color: '#ef8c2b', marginLeft: '10px' }} />
            <span style={{ color: '#f29100', fontSize: '12px' }}>【重要提示：修改消息源和查询字段可能会导致输出的数据格式有变化】</span>
          </div>
          {/* <Form.Item style={{ marginBottom: '0px' }}>
            <Form.Item
              label="产品筛选"
              name="product"
              style={{ width: '40%', float: 'left', marginRight: '10px' }}
              rules={[{ required: true, message: '请选择' }]}
            >
              <Select
                placeholder="请选择"
                options={[
                  { value: '指定产品', label: '指定产品' },
                ]}
              />
            </Form.Item>
            <FormDependencies dependencies={['product']}>
              {({ product }) => product && <Form.Item
                name={['filter', 'product_id']}
                rules={[{ required: true, message: '不能为空' }]}
              >
                <Select
                  placeholder="请选择"
                  loading={productTypeApi.loading}
                  showSearch
                  onSearch={(search) => productTypeApi.run({ name: search })}
                  allowClear
                  options={productTypeApi.data}
                />
              </Form.Item>}
            </FormDependencies>
          </Form.Item> */}
          <Form.Item
            label="消息源"
            name={['filter', 'message_source']}
            rules={[{ required: true, message: '请选择' }]}
          >
            <Select
              placeholder="请选择"
              options={[
                { value: '消息总线', label: '消息总线' },
              ]}
            />
          </Form.Item>
          <Form.Item
            // label={
            //   <div>
            //     <span>查询字段</span>&nbsp;
            //     <Tooltip
            //       placement="rightTop"
            //       title="仅支持'*' 、 ',' 、'.' 、'('、')'、'_'、单引号、 空格、字母和数字，不为空，最多不超过300个字符"
            //     >
            //       <QuestionCircleTwoTone />
            //     </Tooltip>
            //   </div>
            // }
            label="查询字段"
            name={['filter', 'select_name']}
            // rules={[
            //   {
            //     required: true,
            //     validator (rule, value, callback) {
            //       if (!value) {
            //         callback('请输入查询字段')
            //       } else if (/^[a-zA-Z0-9*_,.'() ]+$/.test(value)) {
            //         callback()
            //       } else {
            //         callback("仅支持'*' 、 ',' 、'.' 、'('、')'、'_'、单引号、 空格、字母和数字")
            //       }
            //     },
            //   },
            // ]}
            rules={[{ required: true, message: '请输入查询字段' }]}
          >
            <Input placeholder="请输入" showCount maxLength={300}></Input>
            {/* <TextArea
            showCount
            maxLength={300}
            placeholder="请输入"
            rows={4}></TextArea> */}
          </Form.Item>
          <Form.Item
            label="条件"
            name={['filter', 'condition']}
          >
            <Input placeholder="请输入"></Input>
          </Form.Item>
          <Form.Item
            label="SQL语句展示"
            name={['filter', 'sql']}
          >
            <CodeHighlighter />
          </Form.Item>
        </div>)}
      </>,
    },
    {
      title: '转发方式',
      description: <>
        {onDepsChangeRender(({ name, filter }) => name && filter?.message_source && filter?.select_name
          && <>
            <Form.Item
              label="转发方式"
              name="resource_type"
              rules={[{ required: true, message: '请选择' }]}
            >
              <Radio.Group
                onChange={onChangeMethod}
                value={value}
              >
                {(typeResource.data || []).map((item: string) =>
                  (<Radio value={item} key={item}>
                    {item}
                  </Radio>),
                )}
              </Radio.Group>
            </Form.Item>
            {/* <FormDependencies dependencies={['resource_type']} onDepChange={({ resource_type }) => resource_type && dataResourceApi.run({ type: resource_type })}> */}
            <>
              {onDepsChangeRender(({ resource_type }) => resource_type && (
                <Form.Item
                  label="使用资源"
                  name="data_resource_id"
                  rules={[{ required: true, message: '不能为空' }]}
                  help={
                    <div>
                      您也可以进入
                      <span
                        style={{ color: '#0070ff', cursor: 'pointer' }}
                        onClick={() => {
                          navigate('/advanced/resource/manage')
                        }}
                      >资源管理</span>
                      添加新的实例
                    </div>}
                >
                  <Select
                    // key={method}
                    placeholder="请选择"
                    loading={dataResourceApi.loading}
                    showSearch
                    onSearch={(search) => dataResourceApi.run({ name: search, type: 'HTTP推送' })}
                    allowClear
                    options={dataResourceApi.data}
                  />
                </Form.Item>
              ))}
            </>
          </>)
        }
      </>,
    },
  ], [onDepsChangeRender, dataResourceApi.data])

  return (
    <Drawer
      title={recordId ? '编辑规则' : '添加规则'}
      placement="right"
      open={isModalOpen}
      width={700}
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
                  const params = {
                    ...values,
                    // product: undefined,
                    // method: undefined,
                  }
                  // params.filter.product_id = undefined
                  console.log('params', params)
                  setSubmitting(true)
                  if (recordId) {
                    values.id = recordId
                    editRuleEngine(values)
                      .then(resp => {
                        if (resp.success) {
                          message.success('修改成功')
                          handleClose()
                          onFinish()
                        } else {
                          message.error(resp.errorMsg)
                        }
                      }).finally(() => {
                        setSubmitting(false)
                      })
                  } else {
                    addRuleEngine(params)
                      .then(resp => {
                        if (resp.success) {
                          message.success('添加成功')
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
      <Form form={form} onValuesChange={onValuesChange} initialValues={{
        filter: {
          select_name: '*',
        },
      }}>
        <Steps
          current={current}
          size="small"
          direction="vertical"
          items={step}
        />
      </Form>
    </Drawer>
  )
})

export default AddDirectRule
