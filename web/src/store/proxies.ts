import { Dispatch } from 'react';
import { listProxies } from '../api/proxies';
import { IProxy } from "../interfaces/Proxy";

enum ProxiesActionType {
  RefreshList,
  UpdateProxy,
  AddProxy,
  RemoveProxy,
}

type Action = {
  type: ProxiesActionType.RefreshList;
  payload: IProxy[];
} | {
  type: ProxiesActionType.UpdateProxy;
  payload: IProxy;
} | {
  type: ProxiesActionType.AddProxy;
  payload: IProxy;
} | {
  type: ProxiesActionType.RemoveProxy;
  payload: { id: number }
}

export type ProxyDispatcher = Dispatch<Action>

// reducer create method
export function proxiesReducerInit(): IProxy[] {
  return []
}

export function proxiesReducer(origin: IProxy[], action: Action): IProxy[] {
  switch (action.type) {
    case ProxiesActionType.RefreshList:
      if (!Array.isArray(action.payload)) {
        return [];
      }
      return [...action.payload];
    case ProxiesActionType.UpdateProxy:
      return origin.map((m) => m.id === action.payload.id ? action.payload : m);
    case ProxiesActionType.AddProxy:
      return [action.payload, ...origin];
    case ProxiesActionType.RemoveProxy:
      return origin.filter((m) => m.id !== action.payload.id);
    default:
      throw new Error();
  }
}

// operator methods
export function genRefreshProxiesAction(dispatch: ProxyDispatcher): () => Promise<void> {
  return async () => {
    const res = await listProxies();
    dispatch({
      type: ProxiesActionType.RefreshList,
      payload: res.proxies
    });
  };
}
