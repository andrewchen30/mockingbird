import React, { useState } from 'react';
import { Drawer, Form, Button, Col, Row, Input, Select, Switch, Typography } from 'antd';
import { IProxy } from '../../interfaces/Proxy';
import { ProxyHost } from '../../const/envoy';

const { Option } = Select;

interface Props {
  data: IProxy;
  visible: boolean;
  action: 'toCreate' | 'toUpdate';
  onClose: () => void;
  onComplete: (data: IProxy) => void;
}

function getSubmitText(action: 'toCreate' | 'toUpdate'): string {
  switch (action) {
    case 'toCreate':
      return 'Create';
    case 'toUpdate':
      return 'save';
    default:
      throw new Error('unknown action')
  }
}

export default function ProxyForm(props: Props) {
  const { Text } = Typography;
  const [data, setData] = useState<IProxy>(props.data)
  const setDataByKey = (key: keyof IProxy) => (val: any) => setData({ ...data, [key]: val })

  return (
    <Drawer
      title={props.action === 'toCreate'
        ? "Create a new mocker endpoint"
        : `Update mocker ${props.data.id}`}
      width={720}
      onClose={props.onClose}
      visible={props.visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Text type='secondary' style={{ marginRight: 8 }}>Last update by {props.data.createBy || 'AndrewChen'}</Text>
          <Button onClick={props.onClose} style={{ marginRight: 8 }}>Cancel</Button>
          <Button onClick={() => props.onComplete(data)} type="primary">{getSubmitText(props.action)}</Button>
        </div>
      }>
      <Form layout="vertical" hideRequiredMark>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reqMethod"
              label="Method"
              initialValue={data.reqMethod}
              rules={[{ required: true, message: 'Please select an HTTP method' }]}>
              <Select placeholder="Please select an HTTP method" onChange={setDataByKey('reqMethod')}>
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
                <Option value="DELETE">*</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="prefix"
              label="Prefix"
              initialValue={data.prefix}
              rules={[{ required: true, message: 'Please enter endpoint prefix' }]}>
              <Input
                style={{ width: '100%' }}
                addonBefore={ProxyHost}
                onChange={(e) => setDataByKey('prefix')(e.target.value)}
                placeholder="/api/test/123" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="upstreamName"
              label="UpstreamName"
              initialValue={data.upstreamName}
              rules={[{ required: true, message: 'Please enter endpoint upstreamName' }]}>
              <Input
                style={{ width: '100%' }}
                onChange={(e) => setDataByKey('upstreamName')(e.target.value)}
                placeholder="/api/test/123" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="upstreamHost"
              label="UpstreamHost"
              initialValue={data.upstreamHost}
              rules={[{ required: true, message: 'Please enter endpoint upstreamHost' }]}>
              <Input
                style={{ width: '100%' }}
                onChange={(e) => setDataByKey('upstreamHost')(e.target.value)}
                placeholder="/api/test/123" />
            </Form.Item>
          </Col>
          <Col span={4}>
            <Form.Item
              name="upstreamPort"
              label="UpstreamPort"
              initialValue={data.upstreamPort}
              rules={[{ required: true, message: 'Please enter endpoint upstreamPort' }]}>
              <Input
                style={{ width: '100%' }}
                onChange={(e) => setDataByKey('upstreamPort')(parseInt(e.target.value, 10))}
                placeholder="/api/test/123" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="desc"
              label="Description"
              initialValue={data.desc}
              rules={[
                {
                  required: true,
                  message: 'please enter some descriptions',
                },
              ]}>
              <Input.TextArea
                rows={8}
                onChange={(e) => setDataByKey('desc')(e.target.value)}
                placeholder="please enter some descriptions" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={8}>
            <Form.Item>
              <Switch
                checkedChildren="active"
                unCheckedChildren="inactive"
                checked={data.status === 'active'}
                onChange={(s: boolean) => setDataByKey('status')(s ? 'active' : 'inactive')}
                defaultChecked />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
