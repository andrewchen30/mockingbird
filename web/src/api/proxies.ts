import axios from 'axios';
import omit from 'lodash/omit';
import { notifier } from '../utils/notify';
import { config } from '../config';
import { IListProxyRes, IProxy, IUpdateProxyRes } from '../interfaces/Proxy';

export async function listProxies(): Promise<IListProxyRes> {
  try {
    const res = await axios.get(`${config.host}/api/proxy`);
    return res.data;
  } catch (err) {
    console.error(err);
    notifier.error('list proxy failed', err.message);
    return { proxies: [] };
  }
}

export async function updateProxy(p: IProxy): Promise<IUpdateProxyRes> {
  try {
    const res = await axios.put(`${config.host}/api/proxy/${p.id}`, {
      ...omit(p, 'id'),
    });
    return res.data;
  } catch (err) {
    console.error('update proxy failed', err);
    notifier.error('update proxy failed', err.message);
    return {};
  }
}

export async function createProxy(p: IProxy): Promise<IUpdateProxyRes> {
  try {
    const res = await axios.post(`${config.host}/api/proxy`, { ...p });
    return res.data;
  } catch (err) {
    console.error('create proxy failed', err, JSON.stringify(err));
    notifier.error('create proxy failed', err.message);
    return {};
  }
}

export async function deleteProxy(id: number): Promise<boolean> {
  try {
    await axios.delete(`${config.host}/api/proxy/${id}`);
    return true;
  } catch (err) {
    console.error('delete proxy failed', err, JSON.stringify(err));
    notifier.error('delete proxy failed', err.message);
    return false;
  }
}
