export interface IMocker {
  id?: number;
  desc: string;
  createBy: string;
  prefix: string;
  reqMethod: string;
  resStatus: number;
  resBody: string;
  status: 'active' | 'inactive' | 'updating' | string;
}

export interface IListMockerRes {
  mockers: IMocker[];
}

export interface IUpdateMockerRes {
  mocker?: IMocker;
}
