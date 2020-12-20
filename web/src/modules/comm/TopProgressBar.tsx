import React from 'react';
import { Progress } from '@chakra-ui/react';

export const TopProgressBar: React.FunctionComponent = () => {
  return (
    <Progress
      size="xs"
      position="fixed"
      w="100%"
      top={0}
      left={0}
      bg="gray.900"
      colorScheme="mockingbirdPink"
      isIndeterminate
    />
  );
};
