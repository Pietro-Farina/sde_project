import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { ConfigProvider, theme } from "antd";

const ThemeContext = createContext(null);

/**
 * Light and Dark theme configurations for Ant Design
 */

const seedTokens = {
	colorPrimary: "#597ef7",
};

const lightTheme = {
	algorithm: theme.defaultAlgorithm,
	token: {
		colorPrimary: seedTokens.colorPrimary,
	},
};

const darkTheme = {
	algorithm: theme.darkAlgorithm,
	token: {
		colorPrimary: seedTokens.colorPrimary,
	},
};

/**
 * Helpers
 */
const getInitialTheme = () => {
	if (document.documentElement.getAttribute("data-theme") === "dark") {
		return true;
	}
	return localStorage.getItem("theme") === "dark";
};

/**
 * Provider
 */
export function ThemeProvider({ children }) {
	const [dark, setDark] = useState(getInitialTheme);

	// Persist theme preference to localStorage
	useEffect(() => {
		localStorage.setItem("theme", dark ? "dark" : "light");
		document.documentElement.setAttribute(
			"data-theme",
			dark ? "dark" : "light"
		);
	}, [dark]);

    // Sync theme across tabs
	useEffect(() => {
		const onStorageChange = (e) => {
			if (e.key === "theme") {
				setDark(e.newValue === "dark");
			}
		};

		window.addEventListener("storage", onStorageChange);
		return () => window.removeEventListener("storage", onStorageChange);
	}, []);

    // Stable API to toggle theme
	const toggleTheme = () => setDark((d) => !d);

    // Memoized AntD theme
	const themeConfig = useMemo(() => (dark ? darkTheme : lightTheme), [dark]);

    const contextValue = useMemo(() => ({ dark, toggleTheme }), [dark]);

	return (
		<ThemeContext.Provider value={contextValue}>
			<ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
		</ThemeContext.Provider>
	);
}

/**
 * Hook
 */
export const useTheme = () => {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme must be used inside ThemeProvider");
	return ctx;
};
