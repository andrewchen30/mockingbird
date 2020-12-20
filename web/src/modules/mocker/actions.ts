import { config } from '../../config';
import {
  IListMockerRes,
  IMocker,
  IUpdateMockerRes,
} from '../../interfaces/Mocker';
import createGeneralActions from '../../utils/pagination/generalActions';

const mockerActions = createGeneralActions<IMocker>('Mocker', {
  host: config.host,
  baseAPIPath: '/api/mockers',
  justOnSuccess: {
    create: (body: IUpdateMockerRes) => body,
    list: (body: IListMockerRes) => body.mockers,
    update: (body: IUpdateMockerRes) => body,
  },
});

export const listMockerAction = mockerActions.list;
export const createMockerAction = mockerActions.create;
export const updateMockerAction = mockerActions.update;
export const deleteMockerAction = mockerActions.delete;
