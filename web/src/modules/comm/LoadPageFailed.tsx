import React from 'react';
import { Box, Text, Button, Heading } from '@chakra-ui/react';

interface LoadPageFailedProps {
  errMsg?: string;
  onReloadBtnClick?: () => void;
}

export const LoadPageFailed: React.FunctionComponent<LoadPageFailedProps> = (
  props
) => {
  return (
    <Box paddingTop={24}>
      <Heading mb={3}>Load page failed!</Heading>
      <Text fontSize="lg">
        {props.errMsg || 'Unknown error. No Error message.'}
      </Text>
      {props.onReloadBtnClick && (
        <Button
          size="lg"
          colorScheme="mockingbirdPink"
          mt="3em"
          onClick={props.onReloadBtnClick}
        >
          Click to reload.
        </Button>
      )}
    </Box>
  );
};
