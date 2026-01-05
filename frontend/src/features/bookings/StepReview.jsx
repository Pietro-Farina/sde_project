import { Card, List, Typography } from "antd";

const weekdayMap = [
	"Sunday",
	"Monday",
	"Tuesday",
	"Wednesday",
	"Thursday",
	"Friday",
	"Saturday",
];

function getDayKey(dateString) {
	const date = new Date(dateString);
	return weekdayMap[date.getDay()];
}

const { Title, Text } = Typography;

export function StepReview({ selectedSlots, selectedSlotsIds, course }) {

	return (
		<Card>
			<Title level={3}>Review your booking</Title>

			<Text>
				Please review the selected time slots before proceeding to
				payment.
			</Text>

            <br /><br />
            <Text strong>Selected Course: {course.name}</Text>
            <br />
			<Text strong>Selected Slots:</Text>
			<List
				dataSource={selectedSlots}
				renderItem={(slot) => (
					<List.Item key={slot._id} style={{ paddingLeft: 15 }}>
						{"  -  "}<Text strong>{getDayKey(slot.start)}</Text>
						{": "}
						{new Date(slot.start).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
						{" – "}
						{new Date(slot.end).toLocaleTimeString([], {
							hour: "2-digit",
							minute: "2-digit",
						})}
					</List.Item>
				)}
			/>
		</Card>
	);
}
