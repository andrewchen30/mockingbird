import React from 'react';
import styled from 'styled-components';
import JSONPretty from 'react-json-pretty';
import { CODE_GRAY, FRONT_WHITE, LIGHT_GRAY } from '../../const/color';

function JSONBeautifier(props: { jsonStr: string }) {
  return (
    <Container>
      <JSONPretty
        id="json-pretty"
        style={{ fontSize: '.9em' }}
        theme={{
          main: `line-height:1.3;color:${LIGHT_GRAY};background:${CODE_GRAY};overflow:auto;`,
          error: `line-height:1.3;color:${LIGHT_GRAY};background:${CODE_GRAY};overflow:auto;`,
          key: 'color:#d19130;',
          string: 'color:#91ba45;',
          value: `color:${FRONT_WHITE};`,
          boolean: 'color:#cc4954;',
        }}
        data={props.jsonStr}
      ></JSONPretty>
    </Container>
  );
}

const Container = styled.div`
  padding: 16px 12px 2px 12px;
  margin: 4px 0;
  border-radius: 8px;
  min-width: 400px;
  max-width: 800px;
  background-color: ${CODE_GRAY};
`;

export default JSONBeautifier;
