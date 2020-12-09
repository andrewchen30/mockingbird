import React, { useCallback } from 'react';
import { NavLink, useRouteMatch } from "react-router-dom";
import {
  Flex,
  Spacer,
  Box,
} from "@chakra-ui/react";
import { IMenuItem, MENU } from './constants';

interface MenuProps {

}

interface MenuItemProps {
  item: IMenuItem;
}

const MenuItem: React.FunctionComponent<MenuItemProps> = ({ item }) => {
  const match = useRouteMatch(item.path);
  const isCurrentPage = useCallback(() => Boolean(match), [match])
  return (
    <Box
      p='12px 0 12px 24px'
      fontWeight={600}
      textDecoration={isCurrentPage() ? 'underline' : ''}
      color={isCurrentPage() ? 'mockingbirdPink.600' : ''}
    >
      <NavLink exact to={item.path}>
        {item.title}
      </NavLink>
    </Box>
  );
}

const Menu: React.FunctionComponent<MenuProps> = () => {
  return (
    <Flex
      h='100%'
      paddingTop='24px'
      flexDirection='column'>
      {MENU.map((item, i) => <MenuItem key={i} item={item}/>)}
      <Spacer/>
    </Flex>
  );
}

export default Menu;