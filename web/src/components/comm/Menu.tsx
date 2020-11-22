import React, { useCallback, useContext, useEffect, useState } from 'react'
import { NavLink } from "react-router-dom";
import { Menu, Progress } from 'antd'
import { CloseCircleOutlined, CheckCircleOutlined, QuestionCircleOutlined, SyncOutlined} from '@ant-design/icons'
import { MENU } from '../../const/menu';
import { pareEventData, socketCtx } from '../../utils/socket';
import styled from 'styled-components';
import { FRONT_ERROR, FRONT_SUCCESS, FRONT_WARNING } from '../../const/color';
import { StatusEvent } from '../../interfaces/pkg/pb/events_pb';

enum ConnStatus {
  alive = 'alive',
  disconnect = 'disconnect',
  unknown = 'unknown',
}

interface ISocketStatus {
  mockingbird: ConnStatus;
  envoy: ConnStatus
}

const initConnStatus = {
  mockingbird: ConnStatus.unknown,
  envoy: ConnStatus.unknown
};

function renderStatus(s: ConnStatus, serviceName: string): JSX.Element {
  switch (s) {
    case ConnStatus.alive:
      return (
          <StatusItem>
            <td width={24}>
              <Progress percent={100} showInfo={false} steps={5} size="small" strokeColor={FRONT_SUCCESS}/>
            </td>
            <td width={12}>
                <CheckCircleOutlined style={{ color: FRONT_SUCCESS }} />
            </td>
            <ServiceName>{serviceName}</ServiceName>
          </StatusItem>
      );
    case ConnStatus.disconnect:
      return (
          <StatusItem>
            <td>
              <Progress percent={33} showInfo={false} steps={5} size="small" strokeColor={FRONT_ERROR} />
            </td>
            <td>
                <CloseCircleOutlined style={{ color: FRONT_ERROR }} />
            </td>
            <ServiceName>{serviceName}</ServiceName>
          </StatusItem>
      );
    case ConnStatus.unknown:
    default:
      return (
          <StatusItem>
            <td>
              <Progress percent={64} showInfo={false} steps={5} size="small" strokeColor={FRONT_WARNING} />
            </td>
            <td>
                <QuestionCircleOutlined style={{ color: FRONT_WARNING }} />
            </td>
            <ServiceName>
              {serviceName}
              <SyncOutlined spin style={{marginLeft: '4px'}} />
            </ServiceName>
          </StatusItem>
      );
  }
}

export default function MenuList() {
  const { Item } = Menu;
  const socket = useContext(socketCtx)
  const [socketState, setSocketState] = useState<ISocketStatus>(initConnStatus)
  const socketCb = useCallback(() => {
    socket.on('connect', function () {
      setSocketState({
        mockingbird: ConnStatus.alive,
        envoy: ConnStatus.unknown
      })
    });
    socket.on('status_event', function (data: any) {
      const e = pareEventData<StatusEvent.AsObject>(data);
      if (!e) {
        return;
      }
      setSocketState({
        mockingbird: e.mockingbird as ConnStatus,
        envoy: e.envoy as ConnStatus
      })
    });
    socket.on('disconnect', function () {
      setSocketState({
        mockingbird: ConnStatus.disconnect,
        envoy: ConnStatus.unknown
      })
    });
  }, [socket])

  useEffect(() => { socketCb() })

  return (
    <Menu
      style={{ width: 256, height: '100%'}}
      defaultSelectedKeys={[MENU[0].path]}
      mode='inline'>
      {MENU.map((item, i) => (
        <Item key={item.path} title={item.title}>
          <NavLink key={i} exact to={item.path}>
            {item.title}
          </NavLink>
        </Item>
      ))}

      <StatusFooter>
        <tbody>
          {renderStatus(socketState.mockingbird, 'Mockingbird Service')}
          {renderStatus(socketState.envoy, 'Envoy Proxy')}
        </tbody>
      </StatusFooter>
    </Menu>
  )
}

const StatusFooter = styled.table`
  position: fixed;
  bottom: 0;
  margin: 0 0 24px 24px;
  /* width: 232px; */
`;

const StatusItem = styled.tr`
  height: 28px;
`;

const ServiceName = styled.td`
  padding-left: 8px;
`;
