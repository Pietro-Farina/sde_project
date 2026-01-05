import { Card, Collapse, Typography } from "antd";
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
						<Text>
                            {course.description}
                        </Text>
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
