import React, { useState } from 'react';
import {
  Drawer,
  Form,
  Button,
  Col,
  Row,
  Input,
  Select,
  Switch,
  Typography,
} from 'antd';
import { IMocker } from '../../interfaces/Mocker';
import { ProxyHost } from '../../const/envoy';
import { notifier } from '../../utils/notify';

const { Option } = Select;

interface Props {
  data: IMocker;
  visible: boolean;
  action: 'toCreate' | 'toUpdate';
  onClose: () => void;
  onComplete: (data: IMocker) => void;
}

function getSubmitText(action: 'toCreate' | 'toUpdate'): string {
  switch (action) {
    case 'toCreate':
      return 'Create';
    case 'toUpdate':
      return 'save';
    default:
      throw new Error('unknown action');
  }
}

export default function MockerForm(props: Props) {
  const { Text } = Typography;
  const [data, setData] = useState<IMocker>(props.data);
  const setDataByKey = (key: keyof IMocker) => (val: any) =>
    setData({ ...data, [key]: val });

  return (
    <Drawer
      title={
        props.action === 'toCreate'
          ? 'Create a new mocker endpoint'
          : `Update mocker ${props.data.id}`
      }
      width={720}
      onClose={props.onClose}
      visible={props.visible}
      bodyStyle={{ paddingBottom: 80 }}
      footer={
        <div style={{ textAlign: 'right' }}>
          <Text type="secondary" style={{ marginRight: 8 }}>
            Last update by {props.data.createBy || 'AndrewChen'}
          </Text>
          <Button onClick={props.onClose} style={{ marginRight: 8 }}>
            Cancel
          </Button>
          <Button onClick={() => props.onComplete(data)} type="primary">
            {getSubmitText(props.action)}
          </Button>
        </div>
      }
    >
      <Form layout="vertical" hideRequiredMark>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="reqMethod"
              label="Method"
              initialValue={data.reqMethod}
              rules={[
                { required: true, message: 'Please select an HTTP method' },
              ]}
            >
              <Select
                placeholder="Please select an HTTP method"
                onChange={setDataByKey('reqMethod')}
              >
                <Option value="GET">GET</Option>
                <Option value="POST">POST</Option>
                <Option value="PUT">PUT</Option>
                <Option value="DELETE">DELETE</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="resStatus"
              label="HTTP status code"
              initialValue={data.resStatus}
              rules={[
                { required: true, message: 'Please enter the HTTP status' },
              ]}
            >
              <Input
                placeholder="200/201/403/404/500"
                onChange={(e) => {
                  try {
                    setDataByKey('resStatus')(parseInt(e.target.value, 10));
                  } catch (error) {
                    notifier.warning(
                      'Response status should be a number.',
                      '200/201/403/404/500'
                    );
                  }
                }}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="prefix"
              label="Prefix"
              initialValue={data.prefix}
              rules={[
                { required: true, message: 'Please enter endpoint prefix' },
              ]}
            >
              <Input
                style={{ width: '100%' }}
                addonBefore={ProxyHost}
                onChange={(e) => setDataByKey('prefix')(e.target.value)}
                placeholder="/api/test/123"
              />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={24}>
            <Form.Item
              name="resBody"
              label="Response body"
              initialValue={data.resBody}
              rules={[
                {
                  required: true,
                  message: 'Enter the mock JSON you want.',
                },
              ]}
            >
              <Input.TextArea
                rows={8}
                onChange={(e) => setDataByKey('resBody')(e.target.value)}
                placeholder='{ "demo": true }'
              />
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
              ]}
            >
              <Input.TextArea
                rows={8}
                onChange={(e) => setDataByKey('desc')(e.target.value)}
                placeholder="please enter some descriptions"
              />
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
                onChange={(s: boolean) =>
                  setDataByKey('status')(s ? 'active' : 'inactive')
                }
                defaultChecked
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Drawer>
  );
}
