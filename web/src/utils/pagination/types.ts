export interface IPaginationQuery {
  status: 'loading' | 'loaded' | 'error';
  error?: string;
  ids: string[];
}

export interface IPaginationStore<Doc> {
  queries: {
    [key: string]: IPaginationQuery;
  };
  index: Map<string, Doc>;
}
