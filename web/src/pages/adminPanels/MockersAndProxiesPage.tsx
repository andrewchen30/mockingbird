import React, { useContext, useEffect } from 'react';
import MockerList from '../../modules/mocker/MockerList';

import mockerPagiCtx from '../../modules/mocker/context';
import { listMockerAction } from '../../modules/mocker/actions';

interface RoutingPageProps {}

const RoutingPage: React.FunctionComponent<RoutingPageProps> = () => {
  const qs = '';
  const mockerCtx = useContext(mockerPagiCtx);
  const mockerQuery = mockerCtx.getByQuery(qs);

  useEffect(() => listMockerAction(mockerCtx, '', false), [mockerCtx]);

  if (!mockerQuery.query || mockerQuery.query.status === 'loading') {
    return <div>loading</div>;
  }

  if (mockerQuery.query.status === 'error') {
    return (
      <div>
        error: {mockerQuery.query.error}
        <button> click to reload </button>
      </div>
    );
  }

  return <MockerList mockers={mockerQuery.docs} />;
};

export default RoutingPage;
