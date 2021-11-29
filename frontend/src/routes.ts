import React, { ComponentType } from "react";
import ShowPipes from "views/pipes/ShowPipes";
import ShowFittings from "views/fittings/ShowFittings";
import NewStrungPipes from "views/stringing/StrungPipes";
import ProjectsPage from "views/administrative/ProjectsPage";
import ProjectSelect from "views/ProjectSelect";
import AboutUs from "views/information/AboutUs";
import ContactUs from "views/information/ContactUs";
import TESTING from "views/TESTING";
import StrungItems from "views/stringing/StrungItems";
import CreateProject from "views/administrative/CreateProject";
import DashboardInventory from "views/dashboard/submenus/DashboardInventory";
import BendInfo from "views/bending/BendInfo";
import MasterLog from "views/masterLog/MasterLog";
import ListUser from "views/userListProj/ListUser";

const Dashboard = React.lazy(() => import("views/dashboard/Dashboard"));
const Login = React.lazy(() => import("views/Login"));

const routes: {
  path: string;
  name: string;
  component: ComponentType<any>;
  exact: boolean;
}[] = [
  { path: "/projects", exact: true, name: "Projects", component: ProjectsPage },
  {
    path: "/project-select",
    exact: true,
    name: "Project Select",
    component: ProjectSelect,
  },
  { path: "/dashboard", exact: true, name: "Dashboard", component: Dashboard },
  {
    path: "/dashboard/inventory",
    exact: true,
    name: "Dashboard",
    component: DashboardInventory,
  },
  { path: "/login", exact: true, name: "Login", component: Login },
  { path: "/pipes", exact: true, name: "Show", component: ShowPipes },
  {
    path: "/pipes/strung",
    exact: true,
    name: "Show",
    component: NewStrungPipes,
  },
  {
    path: "/pipes/strung/new",
    exact: true,
    name: "Show",
    component: StrungItems,
  },
  { path: "/about", exact: true, name: "About", component: AboutUs },
  { path: "/contact", exact: true, name: "Contact", component: ContactUs },
  { path: "/fittings", exact: true, name: "Fittings", component: ShowFittings },
  { path: "/testing", exact: true, name: "TESTING", component: TESTING },
  {
    path: "/create-project",
    exact: true,
    name: "Create Project",
    component: CreateProject,
  },
  { path: "/bending", exact: true, name: "Bending", component: BendInfo },
  { path: "/aggregate", exact: true, name: "Aggregate", component: MasterLog },
  {
    path: "/project/user",
    exact: true,
    name: "Project Users",
    component: ListUser,
  }
];

export default routes;
