import React from "react";
import { useParams, useLocation, useNavigate } from "react-router";
import {
    Result,
    Card,
    Descriptions,
    Typography,
    Space,
    Button,
    Spin,
    Divider,
    Row,
    Col,
} from "antd";
import { useGetCourseByIdQuery } from "../courses/coursesApiSlice";

const { Title, Text } = Typography;

export const BookingSuccessPage = () => {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    // Try navigation state first
    const cachedBooking = location.state?.booking;

    // Fallback to backend
    // const {
    //     data: fetchedBooking,
    //     isLoading: isLoadingBooking,
    //     isError: isErrorBooking,
    // } = useGetBookingByIdQuery(id, {
    //     skip: !!cachedBooking,
    // });

    const booking = cachedBooking// ?? fetchedBooking;

    // 3️Fetch course details
    const {
        data: course,
        isLoading: isLoadingCourse,
        isError: isErrorCourse,
    } = useGetCourseByIdQuery(booking?.courseId, {
        skip: !booking?.courseId,
    });

    // 4Loading state
    // if (isLoadingBooking || isLoadingCourse) {
    if (isLoadingCourse) {
        return (
            <Space
                direction="vertical"
                size="large"
                style={{
                    width: "100%",
                    marginTop: 120,
                    alignItems: "center",
                }}
            >
                <Spin size="large" />
                <Text>Loading booking details…</Text>
            </Space>
        );
    }

    // 5Error state
    //if (isErrorBooking || isErrorCourse || !booking) {
    if (isErrorCourse || !booking) {
        return (
            <Result
                status="error"
                title="Unable to load booking"
                subTitle="The booking details could not be retrieved."
                extra={[
                    <Button key="home" onClick={() => navigate("/")}>
                        Go to Home
                    </Button>,
                    <Button type="primary" key="bookings" onClick={() => navigate("/bookings")}>
                        View my bookings
                    </Button>,
                ]}
            />
        );
    }

    // Success state
    return (
        <div style={{ maxWidth: 960, margin: "0 auto", padding: "48px 16px" }}>
            <Space direction="vertical" size="large" style={{ width: "100%" }}>
                {/* Success Header */}
                <Result
                    status="success"
                    title="Payment successful"
                    subTitle="Your booking has been confirmed."
                />

                {/* Main Content */}
                <Row gutter={[24, 24]}>
                    {/* LEFT — Booking details */}
                    <Col xs={24} md={14}>
                        <Card title="Booking details">
                            <Descriptions column={1} size="middle">
                                <Descriptions.Item label="Booking ID">
                                    <Text code>{booking._id || booking.id}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Course">
                                    {course?.name || "Loading..."}
                                </Descriptions.Item>

                                <Descriptions.Item label="Number of slots">
                                    <Text>{booking.slots?.length || 0} slot{booking.slots?.length !== 1 ? 's' : ''}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Transaction ID">
                                    <Text code>{booking.transactionId}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Status">
                                    <Text strong style={{ textTransform: 'capitalize' }}>{booking.status}</Text>
                                </Descriptions.Item>

                                <Descriptions.Item label="Booking date">
                                    <Text>{new Date(booking.createdAt).toLocaleString()}</Text>
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    </Col>

                    {/* RIGHT — Payment summary */}
                    <Col xs={24} md={10}>
                        <Card title="Payment summary">
                            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text>Payment method</Text>
                                    <Text>PayPal</Text>
                                </Space>

                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Text>Number of slots</Text>
                                    <Text>{booking.slots?.length || 0}</Text>
                                </Space>

                                <Divider />

                                <Space
                                    style={{
                                        width: "100%",
                                        justifyContent: "space-between",
                                    }}
                                >
                                    <Title level={5} style={{ margin: 0 }}>
                                        Total paid
                                    </Title>
                                    <Title level={5} style={{ margin: 0 }}>
                                        €{parseFloat(booking.price || 0).toFixed(2)}
                                    </Title>
                                </Space>
                            </Space>
                        </Card>
                    </Col>
                </Row>

                {/* Actions */}
                <Card>
                    <Space
                        style={{
                            width: "100%",
                            justifyContent: "space-between",
                            flexWrap: "wrap",
                            gap: 16,
                        }}
                    >
                        <Button onClick={() => navigate("/")}>Back to Home</Button>
                        <Button
                            type="primary"
                            onClick={() => navigate("/bookings")}
                        >
                            View my bookings
                        </Button>
                    </Space>
                </Card>
            </Space>
        </div>
    );
};

export default BookingSuccessPage;
