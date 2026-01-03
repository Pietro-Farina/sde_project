import { Layout, Drawer, Switch } from "antd";
import { useEffect } from "react";
import { useTheme } from "../app/providers/ThemeProvider";

const { Sider } = Layout;

export default function ResponsiveSidebar({
	children,
	isMobile,
	width = 240,
	collapsedWidth = 80,
	theme = "light",
	collapsed,
	drawerOpen,
	setDrawerOpen,
}) {
	useEffect(() => {
		if (!isMobile && drawerOpen) {
			setDrawerOpen(false);
		}
	}, [isMobile, drawerOpen, setDrawerOpen]);
	const { dark, toggleTheme } = useTheme();

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
					<Switch
						checked={dark}
						onChange={toggleTheme}
						checkedChildren="🌙"
						unCheckedChildren="☀️"
					/>
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
