import { Layout, Button, Grid, theme } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import ResponsiveSidebar from "./ResponsiveSidebar";
import { useAppResponsive } from "../app/providers/ResponsiveProvider";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

export default function AppLayout({ sidebarContent, children }) {
	const screens = useBreakpoint();
	console.log(screens);
    const { isMobile, isTablet } = useAppResponsive();

	const [collapsed, setCollapsed] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
    const { token } = theme.useToken();


	const layoutModeRef = useRef(null); // "mobile" | "tablet" | "desktop"

	useEffect(() => {
		let newMode;
		console.log("CHECKING MODE");

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
			console.log("TOGGLING DRAWER");
			setDrawerOpen(true);
		} else {
			console.log("TOGGLING SIDEBAR");
			setCollapsed(!collapsed);
		}
	};
    console.log( token )

	return (
		<Layout className="app-shell">
			<ResponsiveSidebar
				collapsed={collapsed}
				isMobile={isMobile}
				drawerOpen={drawerOpen}
				setDrawerOpen={setDrawerOpen}
			>
				{sidebarContent}
			</ResponsiveSidebar>

			<Layout className="app-main">
				<Header className="app-header" style={{ background: token.colorBgContainer }}>
					<Button
						type="text"
						icon={<MenuOutlined />}
						onClick={toggleSidebar}
					/>
					<span className="app-title">App shell</span>
				</Header>

				<Content className="app-content">
                    {children}
					{/* <div className="app-scroll-area">{children}</div> */}
				</Content>
			</Layout>
		</Layout>
	);
}
