// import { StrictMode } from "react";
// import { createRoot } from "react-dom/client";
// import { BrowserRouter } from "react-router";

// import App from "./App.jsx";
// import "./index.css";

// createRoot(document.getElementById("root")).render(
//   <StrictMode>
//     <BrowserRouter>
//       <App />
//     </BrowserRouter>
//   </StrictMode>
// );

import React, { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "antd/dist/reset.css";
import "./index.css";
import App from "./App.jsx";
import { ThemeProvider } from "./app/providers/ThemeProvider.jsx";
import { ResponsiveProvider } from "./app/providers/ResponsiveProvider.jsx";
import { Provider } from "react-redux";
import { store } from "./app/store";
import { App as AppProvider } from "antd";
import AppLayout from "./components/AppLayout.jsx";
import { SidebarMenu } from "./components/SidebarMenu.jsx";
import { PayPalProvider } from "./app/providers/PayPalProvider.jsx";

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
	<StrictMode>
		<BrowserRouter>
			<Provider store={store}>
				<PayPalProvider>
					<ThemeProvider>
						<ResponsiveProvider>
							<AppProvider>
								<AppLayout sidebarContent={SidebarMenu}>
									<Routes>
										<Route path="*" element={<App />} />
									</Routes>
								</AppLayout>
							</AppProvider>
						</ResponsiveProvider>
					</ThemeProvider>
				</PayPalProvider>
			</Provider>
		</BrowserRouter>
	</StrictMode>
);
