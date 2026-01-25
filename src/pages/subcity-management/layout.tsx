import {
  AppShell,
  Header as MantineHeader,
  Navbar as MantineNavbar,
} from "@mantine/core";
import { Outlet } from "react-router-dom";
import Menus from "../../configs/all-menus";
import Header from "../../components/common/header";
const SuperAdminLayout = () => {
  return (
    <AppShell
      header={
        <MantineHeader height={75}>
          <Header />
        </MantineHeader>
      }
      navbar={
        <MantineNavbar
          width={{ base: 40, md: 240 }}
          height={500}
          className="px-2 w-auto my-10"
        >
          <Menus />
        </MantineNavbar>
      }
      padding="lg"
      styles={{
        main: {
          padding: "auto",
          paddingTop: 80,
        },
      }}
    >
      <Outlet />
    </AppShell>
  );
};

export default SuperAdminLayout;
