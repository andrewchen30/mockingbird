import React, { createContext, useState } from 'react';
import createGeneralMethods, {
  createInitCRUD,
  IBaseCRUD,
} from './generalMethods';
import { IPaginationStore } from './types';

interface CreatePaginationOptions {}

interface IPaginationContext<Doc> extends IBaseCRUD<Doc> {
  store: IPaginationStore<Doc>;
}

function getDefaultInitStore<Doc>(): IPaginationStore<Doc> {
  return {
    queries: {},
    index: new Map(),
  };
}

function createPaginationCtx<Doc>(): React.Context<IPaginationContext<Doc>> {
  const initCtx: IPaginationContext<Doc> = {
    store: getDefaultInitStore(),
    ...createInitCRUD(),
  };
  return createContext<IPaginationContext<Doc>>(initCtx);
}

function createPaginationProvider<Doc>(
  opt: CreatePaginationOptions = {}
): [React.FunctionComponent, React.Context<IPaginationContext<Doc>>] {
  const paginationCtx = createPaginationCtx<Doc>();
  const Provider: React.FunctionComponent = ({ children }) => {
    const [store, setStore] = useState<IPaginationStore<Doc>>(
      getDefaultInitStore()
    );

    const baseCRUD = createGeneralMethods<Doc>({ store, setStore });

    return (
      <paginationCtx.Provider value={{ store, ...baseCRUD }}>
        {children}
      </paginationCtx.Provider>
    );
  };

  return [Provider, paginationCtx];
}

export default createPaginationProvider;
