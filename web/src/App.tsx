import React from 'react';
import styled from 'styled-components'
import { Layout } from 'antd';
import { BrowserRouter, Switch, Route } from "react-router-dom";
import Menu from './components/comm/Menu';
import NavBar from './components/comm/NavBar';
import HomePage from './pages/DocumentPage';
import ProxyAndMockersPage from './pages/ProxyAndMockersPage';
import './App.css';


function App() {
  const {Sider, Content, Footer} = Layout
  return (
    <Container className="App">
      <BrowserRouter>
        <Switch>
          <Route exact path="/admin">
            <HomePage />
          </Route>
          <Route path="/">
            <Layout>
              <NavBar />
              <Layout>
                <Sider width={256}>
                  <Menu />
                </Sider>
                <Content>
                  <Switch>
                    <Route exact path="/admin/routes">
                      <ProxyAndMockersPage />
                    </Route>
                  </Switch>
                  <Footer>Made by AndrewChen</Footer>
                </Content>
              </Layout>
            </Layout>
          </Route>
        </Switch>
      </BrowserRouter>
    </Container>
  );
}

const Container = styled.div`
  padding: 0;
  margin: 0;
  font-size: .9em;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol" !important; // ??
`;

export default App;
