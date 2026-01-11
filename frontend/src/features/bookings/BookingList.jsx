import React from "react";
import { Table, Button, Space, Card, Row, Col, Typography, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppResponsive } from "../../app/providers/ResponsiveProvider";
import { useBookings } from "../../hooks/useSlots";
import "./BookingList.css";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";
import { useNavigate } from "react-router";
import { useGetBookingsQuery } from "./bookingApiSlice";
import { useEffect } from "react";

const { Text } = Typography;
const BookingList = () => {
	const { isMobile } = useAppResponsive();
	// const bookings = useBookings();

	const {
		data: normalizedBookings,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetBookingsQuery();

	const { show, hide } = useGlobalSpinner();

	useEffect(() => {
		if (isLoading) {
			show();
		} else {
			hide();
		}
	}, [isLoading]);

	const navigate = useNavigate();

	let tableSource = null;
	console.log("IS SUCCESS:", isSuccess);
	if (isSuccess) {
		if (normalizedBookings?.ids?.length) {
			const { entities, ids } = normalizedBookings;

			tableSource = ids.map((id) => entities[id]).filter((entity) => entity !== undefined);
			console.log("TABLE SOURCE:", tableSource);
		}
	}
	console.log("BOOKINGS:", normalizedBookings);

	const columns = [
		{
			title: "Booking",
			dataIndex: "code",
			key: "code",
			responsive: ["md"], // hide on mobile
		},
		{
			title: "Course",
			dataIndex: "course",
			key: "course",
			width: 100,
			ellipsis: true,
		},
		{
			title: "Customer",
			dataIndex: "customer",
			key: "customer",
			responsive: ["xl"], // hide on mobile
		},
		{
			title: "Date",
			dataIndex: "date",
			key: "date",
			responsive: ["md"], // hide on mobile
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			responsive: ["md"], // desktop only
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 100,
			ellipsis: true,
		},
		// {
		// 	title: "Actions",
		// 	key: "actions",
		// 	render: () => (
		// 		<Space>
		// 			<Button
		// 				type="primary"
		// 				icon={<EditOutlined />}
		// 				size="small"
		// 			/>
		// 			<Button danger icon={<DeleteOutlined />} size="small" />
		// 		</Space>
		// 	),
		// },
	];

	const data = [{}, {}, {}, {}]; // Mock data

	return (
		<>
			<Card
				title="Bookings"
				extra={
					<Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/courses")}>
						New Booking
					</Button>
				}
			>
				<Table
					columns={columns}
					dataSource={tableSource}
					expandable={
						isMobile && {
							expandedRowRender: (record) => (
								<>
									{/* <Row gutter={[8, 8]}>
                                    <Col span={12}>
                                        <Text strong>Booking:</Text>
                                    </Col>
                                    <Col span={12}>{record.code}</Col>
                                    
                                    <Col span={12}>
                                        <Text strong>Customer:</Text>
                                    </Col>
                                    <Col span={12}>{record.customer}</Col>

                                    <Col span={12}>
                                        <Text strong>Date:</Text>
                                    </Col>
                                    <Col span={12}>{record.date}</Col>

                                    <Col span={12}>
                                        <Text strong>Price:</Text>
                                    </Col>
                                    <Col span={12}>{record.price}</Col>
                                </Row> */}

									<div className="booking-card">
										<div>
											<strong>Booking:</strong> {record.code}
										</div>
										<div>
											<strong>Customer:</strong>{" "}
											{record.customer}
										</div>
										<div>
											<strong>Date:</strong> {record.date}
										</div>
										<div>
											<strong>Price:</strong> {record.price} €
										</div>
										<div>
											<strong>Status:</strong> {record.status}
										</div>
									</div>
								</>
							),
							expandRowByClick: true,
						}
					}
				/>
			</Card>
		</>
	);
};

export default BookingList;
