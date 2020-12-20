import React from 'react';
import { Box, Heading, Badge } from '@chakra-ui/react';
import { IMocker } from '../../interfaces/Mocker';
import JSONBeautifier from '../comm/JSONBeautify';

interface MockerListProps {
  mockers: IMocker[];
}

const MockerList: React.FunctionComponent<MockerListProps> = ({ mockers }) => {
  return (
    <Box pt="24px">
      <Heading>Mockers</Heading>
      {mockers.map((mocker) => (
        <Box key={mocker.id} mt={12} mb={12}>
          <Box d="flex" alignItems="baseline" fontSize="2xl" fontWeight={800}>
            <Box mr="1em">{mocker.reqMethod}</Box>
            <Box>{mocker.prefix}</Box>
          </Box>
          <Box>
            <Badge borderRadius="4px" px="2" colorScheme="green">
              {mocker.resStatus}
            </Badge>
          </Box>
          <Box mt={6} mb={6}>
            <JSONBeautifier jsonStr={mocker.resBody} />
          </Box>
          <Box fontSize="sm">{mocker.desc}</Box>
        </Box>
      ))}
    </Box>
  );
};

export default MockerList;
