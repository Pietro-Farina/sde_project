import { Steps, Card } from "antd";
import { useState, useMemo } from "react";
import { SelectionGuide } from "./SelectionGuide";
import { StepSelect } from "./StepSelect";
import { StepReview } from "./StepReview";
import { StepPayment } from "./StepPayment";
import { useSlots } from "../../hooks/useSlots";
import { useParams } from "react-router";
import { useGetCourseByIdQuery } from "../courses/coursesApiSlice";

const steps = [{ title: "Select" }, { title: "Review" }, { title: "Payment" }];

export default function CourseBookingPage() {
	const [current, setCurrent] = useState(0);
	const [selectedSlotsIds, setSelectedSlotsIds] = useState([]);
    const { slots } = useSlots()

    // id corso
	const { id } = useParams();
    const {
        data: course,
        isLoading,
        isSuccess,
        isError,
        error,
    } = useGetCourseByIdQuery(id, { skip: !id });

	const canContinue = useMemo(() => {
		if (current === 0) return selectedSlotsIds.length > 0;
		return true;
	}, [current, selectedSlotsIds]);

    console.log(selectedSlotsIds)
    const selectedSlots = useMemo(() => {
        return selectedSlotsIds.map(id => course?.slots.find(slot => slot._id === id))
    }, [selectedSlotsIds, course])

    if (!course) {
        return <Card>Loading...</Card>
    }

    const userId = "648a1f4e2f8fb814c8d6f9b1"; // TODO: get from auth

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
					selectedSlotsIds={selectedSlotsIds}
					setSelectedSlotsIds={setSelectedSlotsIds}
                    course={course}
				/>
			)}

			{current === 1 && <StepReview selectedSlots={selectedSlots} course={course} />}

			{current === 2 && <StepPayment selectedSlots={selectedSlots} course={course} />}

			{/* Sticky / bottom guide */}
			<SelectionGuide
				step={current}
				selectedSlots={selectedSlots}
                canContinue={canContinue}
                setSelectedSlotsIds={setSelectedSlotsIds}
				onNext={() => setCurrent((s) => s + 1)}
				onBack={() => setCurrent((s) => s - 1)}
			/>
		</>
	);
}
