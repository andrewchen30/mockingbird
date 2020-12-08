import React from 'react';
import { Switch, Route } from "react-router-dom";
import { Grid, GridItem } from "@chakra-ui/react"
import RoutingPage from './adminPanels/MockersAndProxiesPage';

interface AdminPanelPageProps {

}

const AdminPanelPage: React.FunctionComponent<AdminPanelPageProps> = () => {
  return (
    <Grid
      h="100%" gap={0}
      templateRows="100px auto"
      templateColumns="100px auto 0px"
    >
      <GridItem colSpan={3} bg="tomato" />
      <GridItem colSpan={1} bg="papayawhip" />
      <GridItem colSpan={1} bg="black">
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