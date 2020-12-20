// interface CreateGeneraActionsOpt {}
import axios from 'axios';
import { config } from '../../config';
import { IListMockerRes } from '../../interfaces/Mocker';

const RESTFulBaseUrl = '/api/mocker';

interface ActionListOpt<Doc> {
  onLoaded: (list: Doc[]) => void;
  onError: (error: Error) => void;
}

export function actionList<Doc>(opt: ActionListOpt<Doc>) {
  setTimeout(() => {
    axios
      .get<IListMockerRes>(`${config.host}${RESTFulBaseUrl}`)
      .then((res) => opt.onLoaded(res.data.mockers as any))
      .catch(opt.onError);
  }, 3000);
}
