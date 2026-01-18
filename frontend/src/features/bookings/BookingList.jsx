import React, { useState } from "react";
import { Table, Button, Space, Card, Row, Col, Typography, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useAppResponsive } from "../../app/providers/ResponsiveProvider";
import { useBookings } from "../../hooks/useSlots";
import "./BookingList.css";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";
import { useNavigate } from "react-router";
import { useGetBookingsQuery } from "./bookingApiSlice";
import { useGetCoursesQuery } from "../courses/coursesApiSlice";
import { useEffect, useMemo } from "react";

const { Text } = Typography;
const BookingList = () => {
	const { isMobile, isTablet } = useAppResponsive();
	// const bookings = useBookings();

	const {
		data: normalizedBookings,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetBookingsQuery();

	const {
		data: normalizedCourses,
		isLoading: isLoadingCourses,
	} = useGetCoursesQuery();

	const { show, hide } = useGlobalSpinner();

	useEffect(() => {
		if (isLoading || isLoadingCourses) {
			show();
		} else {
			hide();
		}
	}, [isLoading, isLoadingCourses]);

	const navigate = useNavigate();
	const [expandedRowKeys, setExpandedRowKeys] = useState([]);

	// Create a lookup map for course IDs to course names
	const coursesMap = useMemo(() => {
		if (!normalizedCourses?.ids) return {};
		const map = {};
		normalizedCourses.ids.forEach(id => {
			map[id] = normalizedCourses.entities[id];
		});
		return map;
	}, [normalizedCourses]);

	// Helper function to safely format dates
	const formatDate = (dateValue) => {
		if (!dateValue) return '-';
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return '-';
			return date.toLocaleDateString();
		} catch (e) {
			return '-';
		}
	};

	// Helper function to format slot display (day name + time)
	const formatSlot = (dateValue) => {
		if (!dateValue) return '-';
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return '-';
			const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
			const time = date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
			return `${dayName} ${time}`;
		} catch (e) {
			return '-';
		}
	};

	// Helper function to format time from ISO string
	const formatTime = (dateValue) => {
		if (!dateValue) return '-';
		try {
			const date = new Date(dateValue);
			if (isNaN(date.getTime())) return '-';
			return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
		} catch (e) {
			return '-';
		}
	};

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
			dataIndex: "_id",
			key: "id",
			responsive: ["md"], // hide on mobile
		},
		{
			title: "Course",
			dataIndex: "course",
			key: "course",
			width: 200,
			ellipsis: true,
			render: (courseId) => coursesMap[courseId]?.name || courseId,
		},
		{
			title: "Customer",
			dataIndex: "user",
			key: "user",
			responsive: ["xl"], // hide on mobile
		},
		{
			title: "Date",
			dataIndex: "createdAt",
			key: "createdAt",	
			responsive: ["md"], // hide on mobile
			render: (date) => formatDate(date),
		},
		{
			title: "Price",
			dataIndex: "price",
			key: "price",
			responsive: ["md"], // desktop only
			render: (price) => `€${parseFloat(price || 0).toFixed(2)}`,
		},
		{
			title: "Status",
			dataIndex: "status",
			key: "status",
			width: 120,
			render: (status) => {
				const colorMap = {
					confirmed: 'green',
					pending: 'orange',
					cancelled: 'red',
					completed: 'blue',
				};
				return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
			},
		},
		{
			title: "Slots",
			dataIndex: "slots",
			key: "slots",
			width: 250,
			responsive: ["xl"], // desktop only
			render: (slotIds, record) => {
				if (!slotIds || slotIds.length === 0) return '-';
				const course = coursesMap[record.course];
				if (!course?.slots) return '-';
				
				// Find the actual slot details from the course
				const bookingSlots = slotIds.map(slotId => 
					course.slots.find(slot => slot._id === slotId)
				).filter(Boolean);
				
				if (bookingSlots.length === 0) return '-';
				
				return (
					<div style={{ maxHeight: '100px', overflowY: 'auto' }}>
						{bookingSlots.map((slot, index) => (
							<Tag key={index} color="blue" style={{ marginBottom: '4px', fontSize: '11px' }}>
								{formatSlot(slot.start)} - {formatTime(slot.end)}
							</Tag>
						))}
					</div>
				);
			},
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
					rowKey="_id"
					expandable={
						(isMobile || isTablet) && {
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
										<strong>Booking:</strong> {record._id}
									</div>
									<div>
										<strong>Course:</strong> {coursesMap[record.course]?.name || record.course}
									</div>
									<div>
										<strong>Date:</strong> {formatDate(record.createdAt)}
									</div>
									<div>
										<strong>Price:</strong> €{parseFloat(record.price || 0).toFixed(2)}
									</div>
									<div>
										<strong>Status:</strong> <Tag color={{
											confirmed: 'green',
											pending: 'orange',
											cancelled: 'red',
											completed: 'blue',
										}[record.status] || 'default'}>{record.status}</Tag>
									</div>
									<div style={{ marginTop: '8px' }}>
										<strong>Slots:</strong>
										{record.slots && record.slots.length > 0 ? (() => {
											const course = coursesMap[record.course];
											if (!course?.slots) return ' -';
											
											const bookingSlots = record.slots.map(slotId => 
												course.slots.find(slot => slot._id === slotId)
											).filter(Boolean);
											
											if (bookingSlots.length === 0) return ' -';
											
											return (
												<div style={{ marginTop: '4px' }}>
													{bookingSlots.map((slot, index) => (
														<Tag key={index} color="blue" style={{ marginBottom: '4px', marginLeft: '4px', fontSize: '12px' }}>
															{formatSlot(slot.start)} - {formatTime(slot.end)}
														</Tag>
													))}
												</div>
											);
										})() : ' -'}
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
