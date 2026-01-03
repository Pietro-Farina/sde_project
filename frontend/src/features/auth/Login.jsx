import React from "react";
import { Layout, Card, Typography, Button, Space } from "antd";
import {
  GoogleOutlined,
  GithubOutlined,
  LoginOutlined,
} from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const OAUTH_BASE_URL = import.meta.env.VITE_API_BASE_URL;
// e.g. https://api.example.com/auth

const LoginPage = () => {
  const loginWithProvider = (provider) => {
    window.location.href = `${OAUTH_BASE_URL}/oauth/${provider}`;
  };

  return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          padding: 16,
        }}
      >
        <Card
          style={{ width: 360 }}
          bordered={false}
          styles={{ body: { padding: 32 } }}
        >
          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            <div style={{ textAlign: "center" }}>
              <LoginOutlined style={{ fontSize: 32 }} />
              <Title level={3} style={{ marginTop: 8 }}>
                Sign in
              </Title>
              <Text type="secondary">
                Use one of the following providers
              </Text>
            </div>

            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                block
                type="primary"
                size="large"
                icon={<GoogleOutlined />}
                onClick={() => loginWithProvider("google")}
              >
                Continue with Google
              </Button>

              {/* <Button
                block
                size="large"
                icon={<GithubOutlined />}
                onClick={() => loginWithProvider("github")}
              >
                Continue with GitHub
              </Button> */}
            </Space>

            <Text type="secondary" style={{ textAlign: "center", fontSize: 12 }}>
              By continuing, you agree to our Terms & Privacy Policy
            </Text>
          </Space>
        </Card>
        </div>
  );
};

export default LoginPage;
