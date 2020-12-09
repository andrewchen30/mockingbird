import React from 'react';
import { ChakraProvider } from "@chakra-ui/react"
import { BrowserRouter, Switch, Route } from "react-router-dom";

import LandingPage from './pages/LandingPage';
import AdminPanelPage from './pages/AdminPanelPage';

import './App.css';
import { ThemeMockingbird } from './modules/comm/ThemeProvider';

function App() {
  return (
    <ChakraProvider theme={ThemeMockingbird}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/admin">
            <LandingPage/>
          </Route>
          <Route path="/admin/*">
            <AdminPanelPage/>
          </Route>
        </Switch>
      </BrowserRouter>
    </ChakraProvider>
  );
}

export default App;
