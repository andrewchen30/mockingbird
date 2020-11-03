import { Dispatch } from 'react';
import { createMocker, deleteMocker, listMockers, updateMocker } from '../api/mockers';
import { IMocker } from "../interfaces/Mocker";
import { notifier } from '../utils/notify';

enum MockersActionType {
  RefreshList,
  UpdateMocker,
  AddMocker,
  RemoveMocker,
}

type Action = {
  type: MockersActionType.RefreshList;
  payload: IMocker[];
} | {
  type: MockersActionType.UpdateMocker;
  payload: IMocker;
} | {
  type: MockersActionType.AddMocker;
  payload: IMocker;
} | {
  type: MockersActionType.RemoveMocker;
  payload: { id: number }
}

export type MockerDispatcher = Dispatch<Action>

// reducer create method
export function mockersReducerInit(): IMocker[] {
  return []
}

export function mockersReducer(origin: IMocker[], action: Action): IMocker[] {
  switch (action.type) {
    case MockersActionType.RefreshList:
      if (!Array.isArray(action.payload)) {
        return [];
      }
      return [...action.payload];
    case MockersActionType.UpdateMocker:
      return origin.map((m) => m.id === action.payload.id ? action.payload : m);
    case MockersActionType.AddMocker:
      return [action.payload, ...origin];
    case MockersActionType.RemoveMocker:
      return origin.filter((m) => m.id !== action.payload.id);
    default:
      throw new Error();
  }
}

// operator methods
export function genRefreshMockersAction(dispatch: MockerDispatcher): () => Promise<void> {
  return async () => {
    const res = await listMockers();
    dispatch({
      type: MockersActionType.RefreshList,
      payload: res.mockers
    });
  };
}

export function genToggleMockersAction(dispatch: MockerDispatcher): (m: IMocker) => Promise<void> {
  return async (m: IMocker) => {
    dispatch({
      type: MockersActionType.UpdateMocker,
      payload: { ...m, status: 'updating' }
    });

    const nextStatus = m.status === 'active' ? 'inactive' : 'active';
    const res = await updateMocker({ ...m, status: nextStatus });
    
    if (res.mocker) {
      // TODO: check envoy status
      notifier.success(
        `Successfully update mocker status to ${nextStatus}.`,
        'Please wait few second for the backend service to update the Envoy proxy.'
      )
      dispatch({
        type: MockersActionType.UpdateMocker,
        payload: { ...res.mocker }
      });
    } else {
      dispatch({
        type: MockersActionType.UpdateMocker,
        payload: { ...m }
      });
    }
  }
}

export function genUpdateMockersAction(dispatch: MockerDispatcher): (m: IMocker) => Promise<boolean> {
  return async (m: IMocker) => {
    dispatch({
      type: MockersActionType.UpdateMocker,
      payload: { ...m, status: 'updating' }
    });

    const res = await updateMocker({ ...m });

    if (!res.mocker) {
      dispatch({
        type: MockersActionType.UpdateMocker,
        payload: { ...m }
      });
      return false
    }

    // TODO: check envoy status
    notifier.success(
      `Successfully update mocker.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    )
    dispatch({
      type: MockersActionType.UpdateMocker,
      payload: { ...res.mocker }
    });
    return true;
  }
}

export function genCreateMockersAction(dispatch: MockerDispatcher): (m: IMocker) => Promise<boolean> {
  return async (m: IMocker) => {
    const res = await createMocker({ ...m });
    if (!res.mocker) {
      return false
    }
    // TODO: check envoy status
    notifier.success(
      `Successfully create a new mocker.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    )
    dispatch({
      type: MockersActionType.AddMocker,
      payload: { ...res.mocker }
    });
    return true;
  }
}

export function genDeleteMockersAction(dispatch: MockerDispatcher): (mockerId: number) => Promise<boolean> {
  return async (mockerId: number) => {
    const success = await deleteMocker(mockerId);
    // TODO: check envoy status
    if (!success) {
      return false;
    }
    notifier.success(
      `Successfully create a new mocker.`,
      'Please wait few second for the backend service to update the Envoy proxy.'
    );
    dispatch({ type: MockersActionType.RemoveMocker, payload: { id: mockerId } });
    return true;
  }
}
