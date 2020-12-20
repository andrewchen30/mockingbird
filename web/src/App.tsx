import React from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import AdminPanelPage from './pages/AdminPanelPage';

import './App.css';
import { enableMapSet } from 'immer';
import { ThemeMockingbird } from './modules/comm/ThemeProvider';
import { MockerProvider } from './modules/mocker/context';

enableMapSet();

function App() {
  return (
    <ChakraProvider theme={ThemeMockingbird}>
      <MockerProvider>
        <BrowserRouter>
          <Switch>
            <Route exact path="/admin">
              <LandingPage />
            </Route>
            <Route path="/admin/*">
              <AdminPanelPage />
            </Route>
          </Switch>
        </BrowserRouter>
      </MockerProvider>
    </ChakraProvider>
  );
}

export default App;
