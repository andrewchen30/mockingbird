import { createContext } from 'react';
import { config } from '../config';

// from cdn.js
const socket = (window as any).io(config.socketHost);

export const socketCtx = createContext(socket)
