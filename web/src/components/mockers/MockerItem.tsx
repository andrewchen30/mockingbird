import React from 'react';
import styled from 'styled-components';
import { Typography, Card, Tag } from 'antd';
import { IMocker } from '../../interfaces/Mocker';
import HttpStatusCode from '../comm/HttpStatusCode';
import JSONBeautifier from '../../modules/comm/JSONBeautify';
import {
  EditOutlined,
  LoadingOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { genToggleMockersAction, MockerDispatcher } from '../../store/mockers';
import { notifier } from '../../utils/notify';

interface Props {
  mocker: IMocker;
  mockerDispatcher: MockerDispatcher;
  onEditBtnClick: (mockerId: number) => void;
  onDeleteBtnClick: (mockerId: number) => void;
}

function MockerItem(props: Props) {
  const { Text } = Typography;
  const { mocker, mockerDispatcher } = props;
  const toggleMockersAction = genToggleMockersAction(mockerDispatcher);
  const desc = mocker.desc || "This mockers doesn't have any descriptions";

  const mockerStatus =
    mocker.status === 'active' ? (
      <Text strong type="success">
        Active
      </Text>
    ) : mocker.status === 'inactive' ? (
      <Text>Inactive</Text>
    ) : mocker.status === 'updating' ? (
      <LoadingOutlined style={{ fontSize: 13 }} spin />
    ) : (
      <Text type="danger">unknown</Text>
    );

  return (
    <Card
      hoverable
      bordered={false}
      extra={
        <div
          style={{ padding: '4px 12px' }}
          onClick={() => toggleMockersAction(mocker)}
        >
          {mockerStatus}
        </div>
      }
      title={`${mocker.reqMethod} ${mocker.prefix}`}
      style={{
        marginBottom: '24px',
        opacity: mocker.status === 'active' ? 1 : '.5',
      }}
      actions={[
        <span></span>,
        <span></span>,
        <span></span>,
        <span></span>,
        <span></span>,
        <span></span>,
        <DeleteOutlined
          key="delete"
          onClick={() => {
            if (!mocker.id) {
              notifier.warning('MockerId not found', '');
              return;
            }
            props.onDeleteBtnClick(mocker.id);
          }}
        />,
        <EditOutlined
          key="edit"
          onClick={() => {
            if (!mocker.id) {
              notifier.warning('MockerId not found', '');
              return;
            }
            props.onEditBtnClick(mocker.id);
          }}
        />,
      ]}
    >
      <MockerTagWrapper>
        <MockerTag>
          <HttpStatusCode code={mocker.resStatus} />
        </MockerTag>
        <MockerTag>
          <Tag>Mocker</Tag>
        </MockerTag>
        <MockerTag>
          <Tag>{`ID  ${mocker.id}`}</Tag>
        </MockerTag>
      </MockerTagWrapper>
      <MockerItemResBody>
        <JSONBeautifier jsonStr={mocker.resBody} />
      </MockerItemResBody>
      {desc.split('\n').map((str, i) => (
        <span key={i}>
          <Text type="secondary">{str}</Text>
          <br />
        </span>
      ))}
    </Card>
  );
}

const MockerTagWrapper = styled.div`
  display: flex;
  width: 100%;
`;

const MockerTag = styled.span`
  margin: 0 4px 0 0;
`;

const MockerItemResBody = styled.div`
  padding: 4px 0;
`;

export default MockerItem;
