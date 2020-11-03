import React from 'react';
import styled from 'styled-components'
import { Layout } from 'antd';
import Logo from '../../logo.svg';
import { FRONT_WHITE } from '../../const/color';
import { NavLink } from "react-router-dom";

export default function NavBar() {
  const { Header } = Layout
  return (
    <Header style={{
      display: "flex",
      alignItems: 'center',
      justifyContent: 'left',
      padding: '0 18px'
    }}>
      <NavLink to='/admin'>
        <AppLogo src={Logo} alt='' />
      </NavLink>
      <NavLink to='/admin'>
        <AppName> Mockingbird </AppName>
      </NavLink>
    </Header>
  );
}

const AppLogo = styled.img`
  width: 50px;
  height: 50px;
`;

const AppName = styled.h1`
  margin: 12px 12px 12px 5px;
  color: ${FRONT_WHITE};
`;
