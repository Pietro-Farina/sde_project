import { Route, Routes } from "react-router";
import "./App.css";
import { SidebarMenu } from "./components/SidebarMenu";
import AppLayout from "./components/AppLayout";
import ExamplePage from "./components/ExamplePage";
import { ConfigProvider, theme } from "antd";

function App() {

  const lightTheme = {
    token: {
      colorPrimary: '#adc6ff',
    },
  };
  const darkTheme = {
    algorithm: theme.darkAlgorithm,
    token: {
      colorPrimary: '#00b8c4',
      colorText: '#ffffff',
      colorBgContainer: '#1f1f1f',
    },
  };
  
  return (
    <ConfigProvider>
      <Routes>
        <Route
          path="/"
          element={(
            <AppLayout sidebarContent={SidebarMenu}>
              <ExamplePage />
            </AppLayout>
          )}
        />
      </Routes>
    </ConfigProvider>
  );
}

export default App;
