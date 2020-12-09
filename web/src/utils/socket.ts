import { createContext } from 'react';
import { config } from '../config';

// from cdn.js
const socket = (window as any).io(`${config.socket.host}`);

export const socketCtx = createContext(socket);

export function pareEventData<T = any>(data: any): T | null {
  try {
    return JSON.parse(data) as T;
  } catch (error) {
    console.error('pareEventData failed', error);
    return null;
  }
}
