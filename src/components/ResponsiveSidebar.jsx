import { Layout, Drawer, Grid } from "antd";
import { useEffect } from "react";

const { Sider } = Layout;
const { useBreakpoint } = Grid;

export default function ResponsiveSidebar({
  children,
  width = 240,
  collapsedWidth = 80,
  theme = "light",
  collapsed,
  drawerOpen,
  setDrawerOpen,
}) {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  useEffect(() => {
    if (!isMobile && drawerOpen) {
      setDrawerOpen(false);
    }
  }, [isMobile, drawerOpen, setDrawerOpen]);

  return (
    <>
      {!isMobile && (
        <Sider
          width={width}
          collapsedWidth={collapsedWidth}
          collapsed={collapsed}
          theme={theme}
          style={{ height: "100vh" }}
        >
          {children}
        </Sider>
      )}

      {isMobile && (
        <Drawer
          placement="left"
          size={width}
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          styles={{ body: { padding: 0 } }}
        >
          {children}
        </Drawer>
      )}
    </>
  );
}
