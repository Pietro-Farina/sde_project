import { Menu } from "antd";
import {
	CalendarOutlined,
	DashboardOutlined,
	LoginOutlined,
	ShopOutlined,
	SolutionOutlined,
} from "@ant-design/icons";
import { useLocation, useNavigate } from "react-router";
import { useCheckMeQuery } from "../features/auth/authApiSlice";

function resolveSelectedKey(pathname) {
	if (pathname === "/") return "/courses";

	if (pathname.startsWith("/courses")) return "/courses";
	if (pathname.startsWith("/book/")) return "/courses";
	if (pathname.startsWith("/bookings")) return "/bookings";
    if (pathname.startsWith("/login")) return "/login";

	return "";
}

export function SidebarMenu({
    setDrawerOpen,
}) {
	const location = useLocation();
	const navigate = useNavigate();
	const { data } = useCheckMeQuery();

	const menuItems = [
		{
			key: "/courses",
			icon: <ShopOutlined />,
			label: "Courses",
		},
		{
			key: "/bookings",
			icon: <SolutionOutlined />,
			label: "My Bookings",
		},
		...(!data?.authenticated ? [{
			key: "/login",
			icon: <LoginOutlined />,
			label: "Login",
		}] : []),
	];

	return (
		<Menu
			mode="inline"
			selectedKeys={[resolveSelectedKey(location.pathname)]}
			items={menuItems}
			onClick={({ key }) => {
                setDrawerOpen(false);
                navigate(key)}
            }
		/>
	);
}
