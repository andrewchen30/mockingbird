import React from 'react';
import { Switch, Route } from "react-router-dom";
import { Grid, GridItem } from "@chakra-ui/react"
import RoutingPage from './adminPanels/MockersAndProxiesPage';
import NavBar from '../modules/comm/NavBar';
import Menu from '../modules/menu/Menu';

interface AdminPanelPageProps {

}

const AdminPanelPage: React.FunctionComponent<AdminPanelPageProps> = () => {
  return (
    <Grid h="100%" gap={0}
      templateRows="80px auto"
      templateColumns="320px auto 0px"
    >
      <GridItem colSpan={3}>
        <NavBar/>
      </GridItem>
      <GridItem colSpan={1}>
        <Menu/>
      </GridItem>
      <GridItem colSpan={1}>
        <Switch>
          <Route exact path="/admin/routings">
            <RoutingPage/>
          </Route>
        </Switch>
      </GridItem>
    </Grid>
  );
}

export default AdminPanelPage;