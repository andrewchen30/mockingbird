export interface IProxy {
  id?: number;
  status: 'active' | 'inactive' | 'updating' | string;
  desc: string;
  createBy: string;
  prefix: string;
  reqMethod: string;
  allowDomains?: string[];
  upstreamName: string;
  upstreamHost: string;
  upstreamPort: number;
}

export interface IListProxyRes {
  proxies: IProxy[];
}

export interface IUpdateProxyRes {
  proxy?: IProxy;
}