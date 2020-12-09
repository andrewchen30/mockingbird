export interface IMenuItem {
  path: string;
  title: string;
  desc?: string;
  icon?: any;
}

export const MENU: IMenuItem[] = [
  {
    path: '/admin/documents',
    title: 'Documents',
  },
  {
    path: '/admin/routes',
    title: 'Mockers and Proxies',
  },
];
