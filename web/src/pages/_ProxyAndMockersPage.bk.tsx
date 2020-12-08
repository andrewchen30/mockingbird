import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components'
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Divider, Row, Col } from 'antd'
import PageHeader from '../components/comm/PageHeader';
import MockerForm from '../components/mockers/MockerForm';
import MockerList from '../components/mockers/MockerList';
import { IMocker } from '../interfaces/Mocker';
import { notifier } from '../utils/notify';
import ProxyList from '../components/proxies/ProxyList';
import { IProxy } from '../interfaces/Proxy';
import ProxyForm from '../components/proxies/ProxyForm';
import { 
  genCreateMockersAction,
  genDeleteMockersAction,
  genRefreshMockersAction,
  genUpdateMockersAction,
  mockersReducer,
  mockersReducerInit
} from '../store/mockers';
import {
  genCreateProxiesAction,
  genDeleteProxiesAction,
  genRefreshProxiesAction,
  genUpdateProxiesAction,
  proxiesReducer,
  proxiesReducerInit
} from '../store/proxies';
import { AccessLogsList } from '../components/accessLogs/AccessLogsList';

const DefaultMocker: IMocker = {
  prefix: '', 
  reqMethod: 'GET',
  resStatus: 200,
  resBody: '',
  desc: '',
  createBy: 'AndrewChen',
  status: 'active'
}

const DefaultProxy: IProxy = {
  prefix: '/',
  reqMethod: '*',
  desc: '',
  createBy: 'AndrewChen',
  status: 'active',
  upstreamName: '',
  upstreamHost: '',
  upstreamPort: 3000
}

type FormState<T> = {
  visible: false;
} |{
  visible: true;
  action: 'toCreate';
} | {
  visible: true;
  action: 'toUpdate';
  data: T
}

function ProxyAndMockersPage() {
  const [mockers, mockerDispatcher] = useReducer(mockersReducer, [], mockersReducerInit);
  const [proxies, proxyDispatcher] = useReducer(proxiesReducer, [], proxiesReducerInit);
  const [listLoading, setListLoading] = useState(false);
  const refreshProxyAction = genRefreshProxiesAction(proxyDispatcher);
  const refreshMockerAction = genRefreshMockersAction(mockerDispatcher);
  const createMocker = genCreateMockersAction(mockerDispatcher);
  const updateMocker = genUpdateMockersAction(mockerDispatcher);
  const deleteMocker = genDeleteMockersAction(mockerDispatcher);
  const createProxy = genCreateProxiesAction(proxyDispatcher);
  const updateProxy = genUpdateProxiesAction(proxyDispatcher);
  const deleteProxy = genDeleteProxiesAction(proxyDispatcher);

  const [mockerFormState, setMockerFormState] = useState<FormState<IMocker>>({ visible: false });
  const [proxyFormState, setProxyFormState] = useState<FormState<IProxy>>({ visible: false });


  useEffect(() => {
    if (mockers.length === 0) {
      setListLoading(true)
      setTimeout(() => { 
        refreshMockerAction()
        refreshProxyAction()
        setListLoading(false)
      }, 800)
    }
  }, [mockers.length, refreshMockerAction, refreshProxyAction]);


  return (
    <Container>
      <PageHeader title='Proxy & Mockers'/>
      <ControlPanel>
        <Button
          type='primary'
          shape='circle'
          icon={<PlusOutlined />}
          onClick={() => setMockerFormState({ visible: true, action: 'toCreate' })}>
        </Button>
        <Button
          shape='circle'
          loading={listLoading}
          icon={<RedoOutlined />}
          onClick={async () => {
            setListLoading(true)
            await refreshMockerAction();
            await refreshProxyAction();
            setTimeout(() => setListLoading(false), 650);
          }}>
        </Button>
      </ControlPanel>
      <Row gutter={16}>
        <Col span={12}>
          <Divider orientation="left">Mockers</Divider>
          <MockerList
            mockers={mockers}
            onDeleteBtnClick={deleteMocker}
            onEditBtnClick={(mockerId: number) => {
              const target = mockers.find((m) => m.id === mockerId)
              if (!target) {
                notifier.warning('Start editor failed', `Mocker ${mockerId} not found`);
                return;
              }
              setMockerFormState({
                visible: true,
                action: 'toUpdate',
                data: target
              })
            }}
            mockerDispatcher={mockerDispatcher}/>
        </Col>
        <Col span={8}>
          <AccessLogsList/>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <ControlPanel>
            <Button
              shape='circle'
              loading={listLoading}
              icon={<RedoOutlined />}
              onClick={async () => {
                setListLoading(true)
                await refreshMockerAction();
                await refreshProxyAction();
                setTimeout(() => setListLoading(false), 650);
              }}>
            </Button>
          </ControlPanel>
        </Col>
      </Row>
      <Row gutter={16}>
        <Col span={12}>
          <Divider orientation="left">Proxies</Divider>
          <ProxyList
            proxies={proxies}
            onDeleteBtnClick={deleteProxy}
            onEditBtnClick={(proxyId: number) => {
              const target = proxies.find((m) => m.id === proxyId)
              if (!target) {
                notifier.warning('Start editor failed', `Proxy ${proxyId} not found`);
                return;
              }
              setProxyFormState({
                visible: true,
                action: 'toUpdate',
                data: target
              })
            }} />
        </Col>
      </Row>
      {mockerFormState.visible && (
        <MockerForm
          action={mockerFormState.action}
          visible={mockerFormState.visible}
          data={(
            mockerFormState.action === 'toUpdate' ? mockerFormState.data : { ...DefaultMocker }
          )}
          onClose={() => setMockerFormState({ visible: false })}
          onComplete={async (data) => {
            let success: boolean = false;
            if (mockerFormState.action === 'toCreate') {
              success = await createMocker({
                prefix: data.prefix,
                reqMethod: data.reqMethod,
                resStatus: data.resStatus,
                resBody: data.resBody,
                desc: data.desc,
                createBy: data.createBy,
                status: data.status
              });
            }
            else if (mockerFormState.action === 'toUpdate') {
              success = await updateMocker({
                id: data.id,
                prefix: data.prefix,
                reqMethod: data.reqMethod,
                resStatus: data.resStatus,
                resBody: data.resBody,
                desc: data.desc,
                createBy: data.createBy,
                status: data.status
              });
            }
            if (success) {
              setMockerFormState({ visible: false })
            }
          }}
        />
      )}

      {proxyFormState.visible && (
        <ProxyForm
          action={proxyFormState.action}
          visible={proxyFormState.visible}
          data={(
            proxyFormState.action === 'toUpdate' ? proxyFormState.data : { ...DefaultProxy }
          )}
          onClose={() => setProxyFormState({ visible: false })}
          onComplete={async (data) => {
            let success: boolean = false;
            const payload: IProxy = {
              prefix: data.prefix,
              reqMethod: data.reqMethod,
              desc: data.desc,
              createBy: data.createBy,
              status: data.status,
              upstreamName: data.upstreamName,
              upstreamHost: data.upstreamHost,
              upstreamPort: data.upstreamPort
            };

            if (proxyFormState.action === 'toCreate') {
              success = await createProxy(payload);
            }
            else if (proxyFormState.action === 'toUpdate') {
              success = await updateProxy({ id: data.id, ...payload });
            }
            if (success) {
              setProxyFormState({ visible: false })
            }
          }}
        />
      )}
    </Container>
  );
}

const Container = styled.div`
  padding: 0 0 0 24px;
`;

const ControlPanel = styled.div`
  display: flex;
  width: 200px;
  justify-content: flex-start;

  > * {
    margin-right: 12px;
  }
`;

export default ProxyAndMockersPage;
