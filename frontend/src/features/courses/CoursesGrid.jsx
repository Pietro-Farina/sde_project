import React, { useEffect } from "react";
import {
	Typography,
	Row,
	Col,
	Input,
	Select,
	Card,
	Space,
	Pagination,
	Button,
} from "antd";
import { useGetCoursesQuery } from "./coursesApiSlice";
import { useNavigate } from "react-router";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const { Title, Text } = Typography;
const { Search } = Input;

const CoursesGrid = () => {
	const {
		data: courses,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetCoursesQuery("coursesList");

    const { show, hide } = useGlobalSpinner();

    useEffect(() => {
        if (isLoading) {
            show();
        } else {
            hide();
        }
    }, [isLoading]);

    const navigate = useNavigate();

	let tableContent = <p>No data avaiable!</p>;
	if (isError) {
		tableContent = <p className="errmsg">{error?.data?.message}</p>;
	} else if (isSuccess) {
		if (courses?.ids?.length) {
			const { entities, ids } = courses;

			tableContent = ids.map((id) => {
				const course = entities[id];
				return (
					<Col xs={24} sm={12} md={8} lg={6} key={course.id}>
						<Card
							hoverable
							style={{ height: 230 }}
							bodyStyle={{
								display: "flex",
								flexDirection: "column",
								height: "100%",
							}}
						>
							<Title
								level={5}
								style={{ marginBottom: 8, marginTop: 0 }}
							>
								{course.name}
							</Title>
							<div
								style={{
									display: "-webkit-box",
									WebkitLineClamp: 3,
									WebkitBoxOrient: "vertical",
									overflow: "hidden",
									color: "rgba(0, 0, 0, 0.45)",
									fontSize: "14px",
									lineHeight: "1.5715",
								}}
							>
								{course.description}
							</div>

							<Button
								style={{ marginTop: "auto" }}
								onClick={() => navigate(`/book/${course.id}`)}
							>
								Book Now
							</Button>
						</Card>
					</Col>
				);
			});
		} else {
			tableContent = <p>No courses found!</p>;
		}
	}

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
					<Select placeholder="Sort by" style={{ width: "100%" }} />
				</Col>
			</Row>

			{/* Courses grid */}
			<Row gutter={[16, 16]}>
				{isLoading ? <p>Loading...</p> : tableContent}
			</Row>

			{/* Pagination */}
			<div style={{ marginTop: 32, textAlign: "center" }}>
				<Pagination defaultCurrent={1} total={50} />
			</div>
		</div>
	);
};

export default CoursesGrid;
