// interface CreateGeneraActionsOpt {}
import axios from 'axios';
import { isFunction } from 'lodash';
import { IPaginationContext } from '.';
import { config } from '../../config';

const RESTFulBaseUrl = '/api/mocker';

interface ActionListOpt<Doc> {
  onLoaded: (list: Doc[]) => void;
  onError: (error: Error) => void;
}

export function actionList<Doc>(opt: ActionListOpt<Doc>) {
  axios
    .get(`${config.host}${RESTFulBaseUrl}`)
    .then((res) => opt.onLoaded(res.data))
    .catch(opt.onError);
}

type SuccessResponseParser = (body: any) => any;

interface CreateGeneralActionsOpt {
  host: string;
  baseAPIPath: string;
  justOnSuccess: {
    create: SuccessResponseParser;
    list: SuccessResponseParser;
    update: SuccessResponseParser;
  };
}

interface GeneralActions<Doc> {
  create: (ctx: IPaginationContext<Doc>, doc: Doc) => void;
  list: (ctx: IPaginationContext<Doc>, qs: string, force: boolean) => void;
  update: (ctx: IPaginationContext<Doc>, id: string, patch: Doc) => void;
  delete: (ctx: IPaginationContext<Doc>, id: string) => void;
}

function createGeneralActions<Doc>(
  actionModelName: string,
  opt: CreateGeneralActionsOpt
): GeneralActions<Doc> {
  const successPrase = (
    actionType: keyof CreateGeneralActionsOpt['justOnSuccess'],
    value: any
  ): any =>
    opt.justOnSuccess && isFunction(opt.justOnSuccess[actionType])
      ? opt.justOnSuccess[actionType](value)
      : value;

  return {
    create: (ctx: IPaginationContext<Doc>, doc: Doc) => {
      axios
        .post(`${config.host}${RESTFulBaseUrl}`)
        .then((res) =>
          ctx.updateDocById(res.data.id, successPrase('create', res.data))
        )
        .catch(console.error.bind(null, `${actionModelName} update failed`));
    },
    list: (ctx: IPaginationContext<Doc>, qs: string, force: boolean) => {
      const exist = Boolean(ctx.getByQuery(qs).query);
      if (exist && !force) {
        return;
      }
      ctx.onQueryLoading(qs);
      axios
        .get(`${config.host}${RESTFulBaseUrl}?${qs}`)
        .then((res) => ctx.onQueryLoaded(qs, successPrase('list', res.data)))
        .catch((err) => ctx.onQueryError(qs, err));
    },
    update: (ctx: IPaginationContext<Doc>, id: string, patch: Doc) => {
      axios
        .put(`${config.host}${RESTFulBaseUrl}/${id}`)
        .then((res) => ctx.updateDocById(id, successPrase('update', res.data)))
        .catch(console.error.bind(null, `${actionModelName} update failed`));
    },
    delete: (ctx: IPaginationContext<Doc>, id: string) => {
      axios
        .delete(`${config.host}${RESTFulBaseUrl}/${id}`)
        .then((_) => ctx.removeDocById(id))
        .catch(console.error.bind(null, `${actionModelName} delete failed`));
    },
  };
}

export default createGeneralActions;
