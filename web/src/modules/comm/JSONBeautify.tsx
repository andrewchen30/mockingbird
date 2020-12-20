import React from 'react';
import JSONPretty from 'react-json-pretty';
import { Box } from '@chakra-ui/react';

function JSONBeautifier(props: { jsonStr: string }) {
  return (
    <Box p="12px 8px 12px 8px" bg="#282c34" borderRadius="6px" maxWidth="640px">
      <JSONPretty
        id="json-pretty"
        style={{ fontSize: '.9em' }}
        theme={{
          main: `line-height:1.3;color:#676669;background:#282c34;overflow:auto;`,
          error: `line-height:1.3;color:#676669;background:#282c34;overflow:auto;`,
          key: 'color:#d19130;',
          string: 'color:#91ba45;',
          value: `color:white;`,
          boolean: 'color:#cc4954;',
        }}
        data={props.jsonStr}
      ></JSONPretty>
    </Box>
  );
}

export default JSONBeautifier;
