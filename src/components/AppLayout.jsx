import { Layout, Button, Grid } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import ResponsiveSidebar from "./ResponsiveSidebar";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout({ sidebarContent, children }) {
  const screens = useBreakpoint();
  console.log(screens);
  const isMobile = useMemo(() => !screens.md, [screens]);
  const isTablet = useMemo(() => (screens.sm || screens.md) && !screens.lg, [screens]);

  const [collapsed, setCollapsed] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const layoutModeRef = useRef(null); // "mobile" | "tablet" | "desktop"

  useEffect(() => {
    let newMode;
    console.log("CHECLKING MODE");

    if (isMobile) newMode = "mobile";
    else if (isTablet) newMode = "tablet";
    else newMode = "desktop";

    if (!layoutModeRef.current || layoutModeRef.current !== newMode) {
      layoutModeRef.current = newMode;

      if (newMode === "desktop") {
        setCollapsed(false);
      } else {
        setCollapsed(true);
      }
    }
  }, [isMobile, isTablet]);

  const toggleSidebar = () => {
    if (isMobile) {
      setDrawerOpen(true);
    } else {
      setCollapsed((collapsed) => !collapsed);
    }
  };

  return (
    <Layout className="app-shell">
      <ResponsiveSidebar
        collapsed={collapsed}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
      >
        {sidebarContent}
      </ResponsiveSidebar>

      <Layout className="app-main">
        <Header className="app-header" style={{ backgroundColor:'white'}}>
          <Button
            type="text"
            icon={<MenuOutlined />}
            onClick={toggleSidebar}
          />
          <span className="app-title">App shell</span>
        </Header>

        <Content className="app-content">
          <div className="app-scroll-area">
            {children}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
