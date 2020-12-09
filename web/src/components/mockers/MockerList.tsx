import React from 'react';
import { IMocker } from '../../interfaces/Mocker';
import MockerItem from './MockerItem';
import { MockerDispatcher } from '../../store/mockers';

interface Props {
  mockers: IMocker[];
  mockerDispatcher: MockerDispatcher;
  onEditBtnClick: (mockerId: number) => void;
  onDeleteBtnClick: (mockerId: number) => void;
}

export default function MockerList(props: Props) {
  return (
    <>
      {props.mockers.map((m, i) => (
        <MockerItem
          key={i}
          mocker={m}
          onEditBtnClick={props.onEditBtnClick}
          onDeleteBtnClick={props.onDeleteBtnClick}
          mockerDispatcher={props.mockerDispatcher}
        />
      ))}
    </>
  );
}
