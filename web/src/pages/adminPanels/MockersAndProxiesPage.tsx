import React, { useContext, useEffect } from 'react';
import { IMocker } from '../../interfaces/Mocker';
import mockerPagiCtx from '../../modules/mocker/context';
import MockerList from '../../modules/mocker/MockerList';
import { actionList } from '../../utils/pagination/generalActions';

interface RoutingPageProps {}

const RoutingPage: React.FunctionComponent<RoutingPageProps> = () => {
  const qs = '';
  const mockerCtx = useContext(mockerPagiCtx);
  const mockerQuery = mockerCtx.getByQuery(qs);

  useEffect(() => {
    if (mockerQuery.query) {
      return;
    }
    mockerCtx.onQueryLoading('');
    actionList<IMocker>({
      onLoaded: (data) => mockerCtx.onQueryLoaded(qs, data),
      onError: (err) => mockerCtx.onQueryError(qs, err),
    });
  }, [mockerCtx, mockerQuery.query]);

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
