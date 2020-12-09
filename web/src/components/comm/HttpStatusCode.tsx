import React from 'react';
import { Tag, Tooltip } from 'antd';

function HttpStatusCode(props: { code: number }) {
  if (!props.code) {
    return null;
  }

  let tag;

  switch (Math.floor(props.code / 100) * 100) {
    case 200:
      tag = <Tag color="green">{props.code}</Tag>;
      break;
    case 400:
      tag = <Tag color="orange">{props.code}</Tag>;
      break;
    case 500:
      tag = <Tag color="red">{props.code}</Tag>;
      break;
    default:
      tag = <Tag>{props.code}</Tag>;
      break;
  }

  return (
    <Tooltip placement="top" title="HTTP status code">
      {tag}
    </Tooltip>
  );
}

export default HttpStatusCode;
