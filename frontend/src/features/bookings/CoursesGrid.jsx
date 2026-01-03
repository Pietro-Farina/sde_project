import React from "react";
import {
  Typography,
  Row,
  Col,
  Input,
  Select,
  Card,
  Space,
  Pagination
} from "antd";

const { Title, Text } = Typography;
const { Search } = Input;

const CoursesGrid = () => {
  return (
    <div className="courses-page">
      {/* Page header */}
      <Space orientation="vertical" size={4} style={{ marginBottom: 24 }}>
        <Title level={2}>Courses</Title>
        <Text type="secondary">
          Browse available courses and find the right one for you
        </Text>
      </Space>

      {/* Filters */}
      <Row gutter={[16, 16]} align="middle" style={{ marginBottom: 24 }}>
        <Col xs={24} md={10}>
          <Search placeholder="Search courses" allowClear />
        </Col>

        <Col xs={12} md={5}>
          <Select
            placeholder="Category"
            style={{ width: "100%" }}
            allowClear
          />
        </Col>

        <Col xs={12} md={5}>
          <Select
            placeholder="Level"
            style={{ width: "100%" }}
            allowClear
          />
        </Col>

        <Col xs={24} md={4}>
          <Select
            placeholder="Sort by"
            style={{ width: "100%" }}
          />
        </Col>
      </Row>

      {/* Courses grid */}
      <Row gutter={[16, 16]}>
        {[...Array(8)].map((_, i) => (
          <Col xs={24} sm={12} lg={8} xl={6} key={i}>
            <Card
              hoverable
              cover={<div className="course-cover" />}
            >
              <Title level={5}>Course title</Title>
              <Text type="secondary">Beginner · 6 weeks</Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Pagination */}
      <div style={{ marginTop: 32, textAlign: "center" }}>
        <Pagination defaultCurrent={1} total={50} />
      </div>
    </div>
  );
};

export default CoursesGrid;
