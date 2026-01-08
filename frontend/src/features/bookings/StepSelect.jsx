import { Card, Collapse, Typography, Table } from "antd";
import CourseCalendar from "./CourseCalendar";
import ResponsiveCourseCalendar from "./ResponsiveCourseCalendar";

const { Title, Text } = Typography;
export function StepSelect({ selectedSlotsIds, setSelectedSlotsIds, course }) {
	return (
		<>
			<Card>
				<Title level={2}>{course.name}</Title>

				<Collapse style={{ marginTop: 12 }} defaultActiveKey={["0"]}>
					<Collapse.Panel
						header="Course details"
						collapsed={false}
						key="0"
					>
						<div>
							<Text>
								{course.description}
							</Text>


							<div style={{ marginTop: 16 }}>
								<Text strong>Pricing Options:</Text>
								<Table
									dataSource={course.priceOptions.map((option, idx) => ({
										key: idx,
										numberSlots: option.numberSlots,
										price: `$${option.price}`,
									}))}
									columns={[
										{
											title: "Number of Slots",
											dataIndex: "numberSlots",
											key: "numberSlots",
										},
										{
											title: "Price",
											dataIndex: "price",
											key: "price",
										},
									]}
									pagination={false}
									size="small"
									style={{ marginTop: 8 }}
								/>
							</div>
						</div>
					</Collapse.Panel>
				</Collapse>
			</Card>

			<Card style={{ marginTop: 16 }}>
				<ResponsiveCourseCalendar
					selectedSlotsIds={selectedSlotsIds}
					setSelectedSlotsIds={setSelectedSlotsIds}
					course={course}
				/>
			</Card>
		</>
	);
}
