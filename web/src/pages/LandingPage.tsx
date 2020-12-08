import React from 'react';
import { NavLink } from "react-router-dom";

interface LandingPageProps {

}

const LandingPage: React.FunctionComponent<LandingPageProps> = () => {
  return (
    <div>
      here is landing page
      <NavLink to='/admin/routings'>
        <button>go to admin panel</button>
      </NavLink>
    </div>
  );
}

export default LandingPage;