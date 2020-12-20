import React from 'react';
import { IMocker } from '../../interfaces/Mocker';
import { IPaginationQuery } from '../../utils/pagination/types';

interface MockerListProps {
  mockers: IMocker[];
}

const MockerList: React.FunctionComponent<MockerListProps> = ({ mockers }) => {
  return (
    <div>
      mockerQuery list
      {mockers.map((mocker) => (
        <div key={mocker.id}>
          id-{mocker.id}
          prefix-{mocker.prefix}
        </div>
      ))}
    </div>
  );
};

export default MockerList;
