import { Layout, Drawer, Switch, Flex, Divider, Typography } from "antd";
import { useEffect } from "react";
import { useTheme } from "../app/providers/ThemeProvider";

const { Sider } = Layout;
const { Title } = Typography;

const width = 240;
const collapsedWidth = 80;
const HEADER_HEIGHT = 64;

function SidebarContent({ dark, toggleTheme, collapsed, children }) {
	return (
		<Flex vertical style={{ height: "100%" }}>
			{/* Header */}
			<Flex
				align="center"
				justify={collapsed ? "center" : "space-between"}
				style={{
					height: HEADER_HEIGHT,
					padding: collapsed ? 0 : "0 16px",
					flexShrink: 0,
				}}
			>
				{!collapsed && <Title level={5}>Dark Mode:</Title>}

				<Switch
					checked={dark}
					onChange={toggleTheme}
					checkedChildren="🌙"
					unCheckedChildren="☀️"
				/>
			</Flex>

			<Divider style={{ margin: 0 }} />

			{/* Main content */}
			<div
				style={{
					flex: 1,
					overflow: "auto",
					padding: collapsed ? "8px 0" : "12px 8px",
				}}
			>
				{children}
			</div>
		</Flex>
	);
}

export default function ResponsiveSidebar({
	collapsed,
	isMobile,
	drawerOpen,
	setDrawerOpen,
	children,
}) {
	useEffect(() => {
		if (!isMobile && drawerOpen) {
			setDrawerOpen(false);
		}
	}, [isMobile, drawerOpen, setDrawerOpen]);
	const { dark, toggleTheme } = useTheme();

	/* Desktop */
	if (!isMobile) {
		return (
			<Sider
				width={width}
				collapsedWidth={collapsedWidth}
				collapsed={collapsed}
				theme={dark ? "dark" : "light"}
				style={{ height: "100vh" }}
			>
				<SidebarContent
					dark={dark}
					toggleTheme={toggleTheme}
					collapsed={collapsed}
				>
					{children}
				</SidebarContent>
			</Sider>
		);
	}

    /* Mobile */
	return (
		<Drawer
			placement="left"
			width={width}
			open={drawerOpen}
			onClose={() => setDrawerOpen(false)}
			styles={{ body: { padding: 0 } }}
		>
			<SidebarContent
				dark={dark}
				toggleTheme={toggleTheme}
				collapsed={false}
			>
				{children}
			</SidebarContent>
		</Drawer>
	);
}
