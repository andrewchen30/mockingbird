import React, { useEffect, useReducer, useState } from 'react';
import styled from 'styled-components'
import { PlusOutlined, RedoOutlined } from '@ant-design/icons';
import { Button, Divider, Row, Col } from 'antd'
import PageHeader from '../components/comm/PageHeader';
import MockerForm from '../components/mockers/MockerForm';
import MockerList from '../components/mockers/MockerList';
import { 
  genCreateMockersAction,
  genDeleteMockersAction,
  genRefreshMockersAction,
  genUpdateMockersAction,
  mockersReducer,
  mockersReducerInit
} from '../store/mockers';
import { IMocker } from '../interfaces/Mocker';
import { notifier } from '../utils/notify';

const DefaultMocker: IMocker = {
  prefix: '', 
  reqMethod: 'GET',
  resStatus: 200,
  resBody: '',
  desc: '',
  createBy: 'AndrewChen',
  status: 'active'
}

type MockerFormState = {
  visible: false;
} |{
  visible: true;
  action: 'toCreate';
} | {
  visible: true;
  action: 'toUpdate';
  data: IMocker
}

function ProxyAndMockersPage() {
  const [mockers, mockerDispatcher] = useReducer(mockersReducer, [], mockersReducerInit);
  const [listLoading, setListLoading] = useState(false);
  const refreshMockerAction = genRefreshMockersAction(mockerDispatcher);
  const createMocker = genCreateMockersAction(mockerDispatcher);
  const updateMocker = genUpdateMockersAction(mockerDispatcher);
  const deleteMocker = genDeleteMockersAction(mockerDispatcher);
  const [mockerFormState, setMockerFormState] = useState<MockerFormState>({ visible: false });


  useEffect(() => {
    if (mockers.length === 0) {
      setListLoading(true)
      setTimeout(() => { 
        refreshMockerAction()
        setListLoading(false)
      }, 800)
    }
  }, [mockers.length, refreshMockerAction]);


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
            await refreshMockerAction()
            setTimeout(() => setListLoading(false), 800)
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
