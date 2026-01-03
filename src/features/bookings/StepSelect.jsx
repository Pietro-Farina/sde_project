import { Card, Collapse, Typography } from "antd";
import CourseCalendar from "./CourseCalendar";
import ResponsiveCourseCalendar from "./ResponsiveCourseCalendar";

const { Title, Text } = Typography;
export function StepSelect({ selectedSlots, onChange, slots }) {
	return (
		<>
			<Card>
				<Title level={2}>Name of Course</Title>

				<Collapse style={{ marginTop: 12 }} defaultActiveKey={["0"]}>
					<Collapse.Panel
						header="Course details"
						collapsed={false}
						key="0"
					>
						<Text>
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                        </Text>
					</Collapse.Panel>
				</Collapse>
			</Card>

			<Card style={{ marginTop: 16 }}>
				<ResponsiveCourseCalendar
					selectedSlots={selectedSlots}
					onSelect={onChange}
					slots={slots}
				/>
			</Card>
		</>
	);
}
