import React from 'react';
import { Image } from '@chakra-ui/react';
import { NavLink } from 'react-router-dom';
import { Flex, Spacer, Center, Heading } from '@chakra-ui/react';

import Logo from '../../logo.svg';

export default function NavBar() {
  return (
    <Flex
      height="100%"
      flexDirection="row"
      justifyContent="left"
      borderBottom="6px solid"
      borderBottomColor="mockingbirdPink.600"
      bg="mockingbirdBlue.900"
    >
      <Center>
        <NavLink to="/admin">
          <Image src={Logo} margin="0 12px 0 16px" boxSize="50px" />
        </NavLink>
      </Center>
      <Center color="white">
        <Heading size="lg" fontWeight="500">
          Mockingbird
        </Heading>
      </Center>
      <Spacer width="20px" />
    </Flex>
  );
}
