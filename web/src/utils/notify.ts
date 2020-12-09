import { notification } from 'antd';
import { IconType } from 'antd/lib/notification';

type Notifier = (msg: string, desc: string) => void;

interface Notify {
  success: Notifier;
  info: Notifier;
  error: Notifier;
  warning: Notifier;
}

const notifyWithIcon = (type: IconType, message: string, description: string) =>
  notification[type]({ message, description, duration: 20 });

export const n = ['success', 'info', 'error', 'warning'].reduce((m, key) => {
  m[key] = (msg: string, desc: string) =>
    notifyWithIcon(key as IconType, msg, desc);
  return m;
}, {} as { [key: string]: Notifier });

export const notifier = (n as any) as Notify;
