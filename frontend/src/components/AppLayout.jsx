import { Layout, Button, Grid, theme, Typography, Divider } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import ResponsiveSidebar from "./ResponsiveSidebar";
import { useAppResponsive } from "../app/providers/ResponsiveProvider";
import { SidebarMenu } from "./SidebarMenu.jsx";
import { useNavigate } from "react-router";

const { Header, Content } = Layout;
const { useBreakpoint } = Grid;

const { Title } = Typography;

export default function AppLayout({ children }) {
	const screens = useBreakpoint();
	console.log(screens);
	const { isMobile, isTablet } = useAppResponsive();

	const [collapsed, setCollapsed] = useState(false);
	const [drawerOpen, setDrawerOpen] = useState(false);
	const { token } = theme.useToken();
    const navigate = useNavigate();

	const layoutModeRef = useRef(null); // "mobile" | "tablet" | "desktop"

    const isLogged = true; // TODO: get from auth state

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
	console.log(token);

	return (
		<Layout className="app-shell">
			<ResponsiveSidebar
				collapsed={collapsed}
				isMobile={isMobile}
				drawerOpen={drawerOpen}
				setDrawerOpen={setDrawerOpen}
			>
				<SidebarMenu setDrawerOpen={setDrawerOpen} />
			</ResponsiveSidebar>

			<Layout className="app-main">
				<Header
					style={{
						background: token.colorBgContainer,
						display: "flex",
						alignItems: "center",
						padding: "0 16px",
					}}
				>
					{/* Left */}
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: 12,
						}}
					>
						<Button
							type="text"
							size="large"
							icon={<MenuOutlined />}
							onClick={toggleSidebar}
						/>
						<Divider type="vertical" />
						<Title level={4} style={{ margin: 0 }} 
                            >
							Booking App
						</Title>
					</div>

					{/* Right (future-proof) */}
					<div
						style={{ marginLeft: "auto", display: "flex", gap: 12 }}
					>
						{/* User avatar, notifications, etc. */}
                        {isLogged ? <Button
                        onClick={() => navigate("/logout")}
                        >Logout</Button> : <Button
                        onClick={() => navigate("/login")}
                        >Login</Button>}
					</div>
				</Header>

				<Content className="app-content">
					{children}
					{/* <div className="app-scroll-area">{children}</div> */}
				</Content>
			</Layout>
		</Layout>
	);
}
