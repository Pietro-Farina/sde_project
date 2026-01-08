import { Card, Button, Space, Tag, Typography, Tooltip, Statistic, Divider, Row, Col } from "antd";

const weekdayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDayKey(dateString) {
	const date = new Date(dateString);
	return weekdayMap[date.getDay()];
}

const { Text } = Typography;
export function SelectionGuide({
	step,
	selectedSlots,
	canContinue,
	canGoBack,
	onNext,
	onBack,
	optionSelected,
	setSelectedSlotsIds,
	onStartBooking,
}) {
	const removeSlot = (slotId) => {
		// `selectedSlots` is an array of IDs, not slot objects.
		// Filter by ID to correctly update state.
		setSelectedSlotsIds((prev) => prev.filter((id) => id !== slotId));
	};

	return (
		<Card
			size="small"
			style={{
				position: "sticky",
				bottom: 0,
				marginTop: 16,
				zIndex: 10,
			}}
		>
			{step === 0 && (
				<Space wrap style={{ minHeight: 32 }}>
					<Text strong>Selected slots:</Text>
					{selectedSlots.length === 0 && (
						<Text type="secondary">None</Text>
					)}
					{selectedSlots.map((slot) => (
						<Tag
							key={slot._id}
							closable={step === 0}
							onClose={() => removeSlot(slot._id)}
						>
							<Text strong>{getDayKey(slot.start)}</Text>
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
						</Tag>
					))}
				</Space>
			)}

			{step === 1 && (
				<div>
					<Text>Proceed with payment by clicking continue below.</Text>
					<Divider style={{ margin: "12px 0" }} />
					<Row gutter={32} justify="center">
						<Col>
							<Statistic
								title="Slots Selected"
								value={selectedSlots.length}
								suffix="slots"
								styles={{ content: { color: "#1890ff", fontWeight: "bold" } }}
							/>
						</Col>
						<Col>
							{optionSelected !== null ? (
								<Statistic
									title="Total Price"
									value={optionSelected.price}
									prefix="€"
									styles={{ content: { color: "#52c41a", fontWeight: "bold", fontSize: "24px" } }}
								/>
							) : (
								<Statistic
									title="Total Price"
									value="Unavailable"
									styles={{ content: { color: "#ff4d4f" } }}
								/>
							)}
						</Col>
					</Row>
				</div>
			)}

			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginTop: 12,
				}}
			>
				<div>
					<Button onClick={onBack} disabled={!canGoBack} hidden={step === 0}>
						Back
					</Button>
				</div>

				<Tooltip title={!optionSelected ? "Please select a valid number of slots" : ""} placement="top">
					<Button type="primary" disabled={!canContinue} onClick={step === 2 ? onStartBooking : onNext}>
						{step === 2 ? "Pay" : "Continue"}
					</Button>
				</Tooltip>
			</div>
		</Card>
	);
}
