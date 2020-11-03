import axios from "axios";
import omit from 'lodash/omit'
import { notifier } from '../utils/notify'
import {config} from '../config';
import { IListMockerRes, IMocker, IUpdateMockerRes } from "../interfaces/Mocker";

export async function listMockers(): Promise<IListMockerRes> {
  try {
    const res = await axios.get(`${config.host}/api/mocker`)
    return res.data
  } catch (err) {
    console.error(err);
    notifier.error('listMockers failed', err.message)
    return { mockers: [] };
  }
}

export async function updateMocker(m: IMocker): Promise<IUpdateMockerRes> {
  try {
    const res = await axios.put(`${config.host}/api/mocker/${m.id}`, {...omit(m, 'id')})
    return res.data
  } catch (err) {
    console.error('update failed', err)
    notifier.error('update failed', err.message)
    return {};
  }
}

export async function createMocker(m: IMocker): Promise<IUpdateMockerRes> {
  try {
    const res = await axios.post(`${config.host}/api/mocker`, { ...m })
    return res.data
  } catch (err) {
    console.error('create failed', err, JSON.stringify(err))
    notifier.error('create failed', err.message)
    return {};
  }
}

export async function deleteMocker(id: number): Promise<boolean> {
  try {
    await axios.delete(`${config.host}/api/mocker/${id}`)
    return true;
  } catch (err) {
    console.error('delete failed', err, JSON.stringify(err))
    notifier.error('delete failed', err.message)
    return false;
  }
}