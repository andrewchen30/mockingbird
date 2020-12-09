import { Dispatch } from 'react';
import {
  createProxy,
  deleteProxy,
  listProxies,
  updateProxy,
} from '../api/proxies';
import { IProxy } from '../interfaces/Proxy';
import { notifier } from '../utils/notify';

enum ProxiesActionType {
  RefreshList,
  UpdateProxy,
  AddProxy,
  RemoveProxy,
}

type Action =
  | {
      type: ProxiesActionType.RefreshList;
      payload: IProxy[];
    }
  | {
      type: ProxiesActionType.UpdateProxy;
      payload: IProxy;
    }
  | {
      type: ProxiesActionType.AddProxy;
      payload: IProxy;
    }
  | {
      type: ProxiesActionType.RemoveProxy;
      payload: { id: number };
    };

export type ProxyDispatcher = Dispatch<Action>;

// reducer create method
export function proxiesReducerInit(): IProxy[] {
  return [];
}

export function proxiesReducer(origin: IProxy[], action: Action): IProxy[] {
  switch (action.type) {
    case ProxiesActionType.RefreshList:
      if (!Array.isArray(action.payload)) {
        return [];
      }
      return [...action.payload];
    case ProxiesActionType.UpdateProxy:
      return origin.map((m) =>
        m.id === action.payload.id ? action.payload : m
      );
    case ProxiesActionType.AddProxy:
      return [action.payload, ...origin];
    case ProxiesActionType.RemoveProxy:
      return origin.filter((m) => m.id !== action.payload.id);
    default:
      throw new Error();
  }
}

// operator methods
export function genRefreshProxiesAction(
  dispatch: ProxyDispatcher
): () => Promise<void> {
  return async () => {
    const res = await listProxies();
    dispatch({
      type: ProxiesActionType.RefreshList,
      payload: res.proxies,
    });
  };
}

export function genUpdateProxiesAction(
  dispatch: ProxyDispatcher
): (m: IProxy) => Promise<boolean> {
  return async (p: IProxy) => {
    dispatch({
      type: ProxiesActionType.UpdateProxy,
      payload: { ...p, status: 'updating' },
    });

    const res = await updateProxy({ ...p });
    if (!res.proxy) {
      dispatch({
        type: ProxiesActionType.UpdateProxy,
        payload: { ...p },
      });
      return false;
    }

    // TODO: check envoy status
    notifier.success(
      `Successfully update proxy.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    );
    dispatch({
      type: ProxiesActionType.UpdateProxy,
      payload: { ...res.proxy },
    });
    return true;
  };
}

export function genCreateProxiesAction(
  dispatch: ProxyDispatcher
): (m: IProxy) => Promise<boolean> {
  return async (m: IProxy) => {
    const res = await createProxy({ ...m });
    if (!res.proxy) {
      return false;
    }
    // TODO: check envoy status
    notifier.success(
      `Successfully create a new proxy.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    );
    dispatch({
      type: ProxiesActionType.AddProxy,
      payload: { ...res.proxy },
    });
    return true;
  };
}

export function genDeleteProxiesAction(
  dispatch: ProxyDispatcher
): (proxyId: number) => Promise<boolean> {
  return async (proxyId: number) => {
    const success = await deleteProxy(proxyId);
    // TODO: check envoy status
    if (!success) {
      return false;
    }
    notifier.success(
      `Successfully create a new proxy.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    );
    dispatch({ type: ProxiesActionType.RemoveProxy, payload: { id: proxyId } });
    return true;
  };
}
