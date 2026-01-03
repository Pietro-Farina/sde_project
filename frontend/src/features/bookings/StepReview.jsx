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

export function StepReview({ slots }) {
	return (
		<Card>
			<Title level={3}>Review your booking</Title>

			<Text>
				Please review the selected time slots before proceeding to
				payment.
			</Text>

            <br /><br />
            <Text strong>Selected Course: Course Name</Text>
            <br />
			<Text strong>Selected Slots:</Text>
			<List
				dataSource={slots}
				renderItem={(slot) => (
					<List.Item key={slot.id} style={{ paddingLeft: 15 }}>
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
