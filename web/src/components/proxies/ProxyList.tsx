import React from 'react'
import { IProxy, } from '../../interfaces/Proxy';
import ProxyItem from './ProxyItem';

interface Props {
  proxies: IProxy[];
}

export default function ProxyList(props: Props) {
  return (
    <>
      {props.proxies.map((p, i) => (
        <ProxyItem key={i} proxy={p} />
      ))}
    </>
  )
}
