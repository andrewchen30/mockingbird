
export interface IMenu {
  path: string;
  title: string;
  desc?: string;
  icon?: any;
}

export const MENU: IMenu[] = [
  {
    path: '/admin/routes',
    title: 'Proxy & Mockers'
  },
  {
    path: '/admin/docs',
    title: 'Documents'
  }
];
