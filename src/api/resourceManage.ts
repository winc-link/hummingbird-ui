import { httpRequest } from '@/utils/request'
import { TableRequestType, CommonResponse } from '@/types'

export interface DataResource {
  id: string
  name: string
  type: string
  created: number
  health: 'false' | 'true'
  option: {
    url: string
    method: string
    bodyType: string
    timeout: number
    headers: {}
    clientId: string
    password: string
    protocolVersion: string
    qos: number
    server: string
    topic: string
    username: string
    brokers: string
    saslAuthType: string
    saslUserName: number
    saslPassword: string
    addr: string
    db: string
    key: number
    field: string
    dataType: string
    expire: string
    rowkindField: string
    measurement: string
    databasename: string
    tagkey: string
    tagvalue: string
    host: string
    port: number
    user: string
    database: string
    table: string
    fields: string
    provideTs: boolean
    tsFieldName: string
    sTable: string
    tagFields: string
    tableDataField: string
  }
}

export function getDataResource<T> (params: TableRequestType & {
  type?: string
}) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/dataresource',
    params,
  })
}

export function getTypeResource<T> () {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/typeresource',
    method: 'get',
  })
}

export function addResource<T> (data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/dataresource',
    method: 'post',
    data,
  })
}

export function deleteResource (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/dataresource/${id}`,
    method: 'delete',
  })
}

export function testResource (id: string) {
  return httpRequest<any, CommonResponse<any>>({
    url: `/api/v1/dataresource/${id}/health`,
    method: 'post',
  })
}

export interface HttpResource {
  id: string
  name: string
  type: string
  option: {
    url: string
    method: string
    bodyType: string
    timeout: number
    headers: {}
  }
}

export interface MqttResource {
  id: string
  name: string
  type: string
  option: {
    clientId: string
    password: string
    protocolVersion: string
    qos: number
    server: string
    topic: string
    username: string
  }
}

export interface KafkaResource {
  id: string
  name: string
  type: string
  option: {
    brokers: string
    topic: string
    saslAuthType: string
    saslUserName: number
    saslPassword: string
  }
}

export interface RedisResource {
  id: string
  name: string
  type: string
  option: {
    addr: string
    password: string
    db: string
    key: number
    field: string
    dataType: string
    expire: string
    rowkindField: string
  }
}

export interface InfluxDBResource {
  id: string
  name: string
  type: string
  option: {
    addr: string
    password: string
    username: string
    measurement: string
    databasename: string
    tagkey: string
    tagvalue: string
    fields: string
  }
}

export interface TDengineResource {
  id: string
  name: string
  type: string
  option: {
    host: string
    port: number
    user: string
    password: string
    database: string
    table: string
    fields: string
    provideTs: boolean
    tsFieldName: string
    sTable: string
    tagFields: string
    tableDataField: string
  }
}

export function editResource<T> (data: any) {
  return httpRequest<any, CommonResponse<T>>({
    url: '/api/v1/dataresource',
    method: 'put',
    data,
  })
}
