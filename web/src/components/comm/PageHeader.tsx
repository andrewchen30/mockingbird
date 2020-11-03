import React from 'react';
import { Typography } from 'antd';

function PageHeader(props: { title: string }) {
  if (!props.title) {
    return null
  }
  const { Title } = Typography;
  return (
    <Title style={{ margin: '24px 0 12px 0' }}>
      {props.title}
    </Title>
  );
}

export default PageHeader;
