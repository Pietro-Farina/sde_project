import { Steps, Card } from "antd";
import { useState, useMemo } from "react";
import { SelectionGuide } from "./SelectionGuide";
import { StepSelect } from "./StepSelect";
import { StepReview } from "./StepReview";
import { StepPayment } from "./StepPayment";
import { useSlots } from "../../hooks/useSlots";

const steps = [{ title: "Select" }, { title: "Review" }, { title: "Payment" }];

export default function CourseBookingPage() {
	const [current, setCurrent] = useState(0);
	const [selectedSlots, setSelectedSlots] = useState([]);
    const { slots } = useSlots()

	const canContinue = useMemo(() => {
		if (current === 0) return selectedSlots.length > 0;
		return true;
	}, [current, selectedSlots]);

    console.log(selectedSlots)

	return (
		<>
			{/* Step indicator */}
			<Steps
				current={current}
				items={steps}
				style={{ marginBottom: 24 }}
			/>

			{/* Step content */}
			{current === 0 && (
				<StepSelect
					selectedSlots={selectedSlots}
					onChange={setSelectedSlots}
                    slots={slots}
				/>
			)}

			{current === 1 && <StepReview slots={selectedSlots.map(id => slots.find(slot => slot.id === id))} />}

			{current === 2 && <StepPayment slots={selectedSlots.map(id => slots.find(slot => slot.id === id))} />}

			{/* Sticky / bottom guide */}
			<SelectionGuide
				step={current}
				slots={selectedSlots.map(id => slots.find(slot => slot.id === id))}
				canContinue={canContinue}
                setSelectedSlots={setSelectedSlots}
				onNext={() => setCurrent((s) => s + 1)}
				onBack={() => setCurrent((s) => s - 1)}
			/>
		</>
	);
}
