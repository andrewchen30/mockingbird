import React from 'react';
import { produce, createDraft } from 'immer';
import { isFunction } from 'lodash';
import { IPaginationStore, IPaginationQuery } from './types';

interface CreateGeneralMethods<Doc> {
  getId?: (doc: Doc) => string;
  store: IPaginationStore<Doc>;
  setStore: SetStoreMethod<Doc>;
}

type SetStoreMethod<Doc> = React.Dispatch<
  React.SetStateAction<IPaginationStore<Doc>>
>;

export interface IBaseCRUD<Doc> {
  getByID: (id: string) => Doc | undefined;
  getByQuery: (qs: string) => { query: IPaginationQuery | null; docs: Doc[] };
  onQueryLoading: (qs: string) => void;
  onQueryLoaded: (qs: string, list: Doc[]) => void;
  onQueryError: (qs: string, error: Error) => void;
  updateDocById: (id: string, doc: Doc) => void;
  removeDocById: (id: string) => void;
}

function createGeneralMethods<Doc>({
  store,
  setStore,
  ...opt
}: CreateGeneralMethods<Doc>): IBaseCRUD<Doc> {
  return {
    getByID: (id: string) => {
      return store.index.get(id);
    },
    getByQuery: (qs: string) => {
      const q = store.queries[qs];
      if (!q || q.status !== 'loaded') {
        return {
          query: q,
          docs: [],
        };
      }
      const docs = q.ids
        .filter((id: string) => store.index.has(id))
        .map((id: string) => store.index.get(id));

      return {
        query: q,
        docs: docs as Doc[],
      };
    },
    onQueryLoading: (qs: string) => {
      setStore((store) =>
        produce(store, (draft) => {
          draft.queries[qs] = {
            status: 'loading',
            ids: [],
          };
        })
      );
    },
    onQueryError: (qs: string, error: Error) => {
      setStore((store) => {
        if (!store.queries[qs]) {
          console.error('unknown query error, err=', error);
          return store;
        }
        return produce(store, (draft) => {
          draft.queries[qs] = {
            status: 'error',
            error: error.message,
            ids: [],
          };
        });
      });
    },
    onQueryLoaded: (qs: string, list: Doc[]) => {
      setStore((store) =>
        produce(store, (draft) => {
          if (!store.queries[qs]) {
            console.error('unknown query loaded');
            return;
          }
          if (!Array.isArray(list)) {
            console.error('result list is not an array.');
            return;
          }

          const ids = [];

          for (const doc of list) {
            let docId: string = '';
            if (isFunction(opt.getId)) {
              docId = opt.getId(doc);
            } else if ((doc as any)['id']) {
              docId = (doc as any)['id'];
            }
            if (!docId) {
              continue;
            }

            ids.push(docId);
            draft.index.set(docId, createDraft(doc));
          }

          draft.queries[qs].status = 'loaded';
          draft.queries[qs].error = '';
          draft.queries[qs].ids = ids;
        })
      );
    },
    updateDocById: (id: string, doc: Doc) => {
      setStore((store) =>
        produce(store, (draft) => {
          draft.index.set(id, createDraft(doc));
        })
      );
    },
    removeDocById: (id: string) => {
      setStore((store) =>
        produce(store, (draft) => {
          draft.index.delete(id);
        })
      );
    },
  };
}

export function createInitCRUD() {
  return {
    getByID: (id: string) => {
      throw new Error('getByID need init.');
    },
    getByQuery: (qs: string) => {
      throw new Error('getByQuery need init.');
    },
    onQueryLoaded: (qs: string, list: any) => {
      throw new Error('onQueryLoaded need init.');
    },
    onQueryLoading: (qs: string) => {
      throw new Error('onQueryLoading need init.');
    },
    onQueryError: (qs: string, error: Error) => {
      throw new Error('onQueryError need init.');
    },
    updateDocById: (id: string, doc: any) => {
      throw new Error('updateDocById need init.');
    },
    removeDocById: (id: string) => {
      throw new Error('removeDocById need init.');
    },
  };
}

export default createGeneralMethods;
