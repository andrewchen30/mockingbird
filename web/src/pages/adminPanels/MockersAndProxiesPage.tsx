import React, { useContext, useEffect } from 'react';

import MockerList from '../../modules/mocker/MockerList';

import mockerPagiCtx from '../../modules/mocker/context';
import { listMockerAction } from '../../modules/mocker/actions';
import { TopProgressBar } from '../../modules/comm/TopProgressBar';
import { LoadPageFailed } from '../../modules/comm/LoadPageFailed';

interface RoutingPageProps {}

const RoutingPage: React.FunctionComponent<RoutingPageProps> = () => {
  const mockerQs = '';
  const mockerCtx = useContext(mockerPagiCtx);
  const mockerQuery = mockerCtx.getByQuery(mockerQs);

  useEffect(() => listMockerAction(mockerCtx, mockerQs, false), [mockerCtx]);

  if (!mockerQuery.query || mockerQuery.query.status === 'loading') {
    return <TopProgressBar />;
  }

  if (mockerQuery.query.status === 'error') {
    return (
      <LoadPageFailed
        errMsg={mockerQuery.query.error}
        onReloadBtnClick={() => {
          listMockerAction(mockerCtx, mockerQs, true);
        }}
      />
    );
  }

  return <MockerList mockers={mockerQuery.docs} />;
};

export default RoutingPage;
