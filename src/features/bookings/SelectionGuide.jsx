import { Card, Button, Space, Tag, Typography } from "antd";

const weekdayMap = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function getDayKey(dateString) {
	const date = new Date(dateString);
	return weekdayMap[date.getDay()];
}


const { Text } = Typography;
export function SelectionGuide({ step, slots, canContinue, onNext, onBack, setSelectedSlots }) {

    const removeSlot = (slotId) => {
		// `selectedSlots` is an array of IDs, not slot objects.
		// Filter by ID to correctly update state.
		setSelectedSlots((prev) => prev.filter((id) => id !== slotId));
    }

    console.log(slots)

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
                {slots.length === 0 && <Text type="secondary">None</Text>}
				{slots.map((slot) => (
					<Tag key={slot.id} 
                        closable={step === 0}
                        onClose={() => {
                            console.log(slot.id);
                            removeSlot(slot.id)}}
                    >
                        <Text strong>{getDayKey(slot.start)}</Text>{": "}
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
			</Space>)}

            {step === 1 && (
                <Text>Proceed with payment by clicking continue below.</Text>
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
                    <Button onClick={onBack} hidden={step === 0}>Back</Button>
                </div>

				<Button type="primary" disabled={!canContinue} onClick={onNext}>
					{step === 2 ? "Pay" : "Continue"}
				</Button>
			</div>
		</Card>
	);
}
