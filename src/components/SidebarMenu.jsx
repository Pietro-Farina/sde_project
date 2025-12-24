import { Menu } from "antd";
import {
  CalendarOutlined,
  DashboardOutlined,
} from "@ant-design/icons";

export const SidebarMenu = (
  <Menu
    mode="inline"
    items={[
      {
        key: "/dashboard",
        icon: <DashboardOutlined />,
        label: "Dashboard",
      },
      {
        key: "/calendar",
        icon: <CalendarOutlined />,
        label: "Calendar",
      },
    ]}
  />
);
