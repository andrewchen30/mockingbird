import React from 'react';
import styled from 'styled-components';
import { NavLink } from "react-router-dom";
import { Layout, Button } from 'antd'
import { BASE_BLUE, BASE_PINK, FRONT_WHITE } from '../const/color';
import Logo from '../logo.svg'
import Typing from '../components/comm/Typing';

function HomePage() {
  return (
    <BannerContainer>
      <Layout>
        <Layout.Header style={{ backgroundColor: BASE_PINK }} />
      </Layout>
      <LogoImg src={Logo} alt='' />
      <AppTitle>Mockingbrid</AppTitle>
      <Slogan>
        <span style={{ color: BASE_PINK, marginRight: 12 }}>Mockingbird</span>
        <span style={{ marginRight: 12 }}>your</span>
        <div>
          <Typing
            typingDelay={80}
            backspaceDelay={40}
            sentenceShowTime={2000}
            sentenceDelay={600}
            list={[
              'API drafts.',
              'developing APIs.',
              'chaos test.',
              'canary update.',
              'alpha release.'
            ]} />
        </div>
      </Slogan>
      <NavLink to='/admin/routes'>
        <StartBtn>
          <Button ghost size='large'>Get Start</Button>
        </StartBtn>
      </NavLink>
    </BannerContainer>
  );
}

const BannerContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  color: ${FRONT_WHITE};
  text-align: center;

  display: flex;
  text-align: center;
  flex-direction: column;
  height: 100%;
  background-color: ${BASE_BLUE};
  > * {
    background-color: ${BASE_BLUE};
  }
`;

const LogoImg = styled.img`
  width: 18%;
  margin: 0 auto;
  flex-grow: 1;
`;

const AppTitle = styled.div`
  font-size: 5em;
`;

const Slogan = styled.div`
  margin-left: calc(50% - 275px);
  flex-grow: 1;
  font-size: 3em;
  display: flex;
  justify-content: flex-start;
`;

const StartBtn = styled.div`
  flex-grow: 3;
  padding: 80px 0 180px 0; 
`;

export default HomePage;
