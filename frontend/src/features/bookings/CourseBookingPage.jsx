import { Steps, Card, Modal, Button, message } from "antd";
import { useState, useMemo, useEffect, use } from "react";
import { SelectionGuide } from "./SelectionGuide";
import { StepSelect } from "./StepSelect";
import { StepReview } from "./StepReview";
import { StepPayment } from "./StepPayment";
import { useSlots } from "../../hooks/useSlots";
import { useParams } from "react-router";
import { useGetCourseByIdQuery } from "../courses/coursesApiSlice";
import { useStartBookingProcessMutation, useGetActiveReservationQuery, useCancelActiveReservationMutation } from "./bookingApiSlice";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const steps = [{ title: "Select" }, { title: "Review" }, { title: "Payment" }];

export default function CourseBookingPage() {
	const [current, setCurrent] = useState(0);
	const [selectedSlotsIds, setSelectedSlotsIds] = useState([]);
	const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
	const [isReservationActive, setIsReservationActive] = useState(false);
	const [{ isInitial }, dispatch] = usePayPalScriptReducer();
	const { slots } = useSlots()

	// id corso
	const { id } = useParams();
	const userId = "648a1f4e2f8fb814c8d6f9b1"; // TODO: get from auth

	console.log('User ID:', userId);
	console.log('Course ID:', id);

	const {
		data: course,
		isLoading,
		isSuccess,
		isError,
		error,
	} = useGetCourseByIdQuery(id, { skip: !id });

    const { show, hide } = useGlobalSpinner();

	// Check for active reservation on page load
	const {
		data: activeReservation,
		isLoading: activeReservationIsLoading,
		isSuccess: activeReservationIsSuccess,
		isError: activeReservationIsError,
		error: activeReservationError,
	} = useGetActiveReservationQuery({ userId, courseId: id }, { skip: !userId || !id });

	const [
		cancelActiveReservation,
		{
			data: cancelReservationData,
			isLoading: isCancelReservationLoading,
			isSuccess: isCancelReservationSuccess,
			isError: isCancelReservationError,
			error: cancelReservationError,
		}
	] = useCancelActiveReservationMutation();

	// Handle the reservation result one time
	useEffect(() => {
		if (activeReservationIsSuccess && activeReservation) {
			console.log("Active reservation found:", activeReservation);
			setIsReservationModalOpen(true);
		}
		if (activeReservationIsError) {
			console.error("Error checking reservation:", activeReservationError);
			// Handle error (e.g., user has no active reservation)
		}
	}, [activeReservationIsSuccess, activeReservationIsError]);

	const [
		startBookingProcess,
		{
			data: reservationData,
			isLoading: isReservationLoading,
			isSuccess: isReservationSuccess,
			isError: isReservationError,
			error: reservationError,
		}
	] = useStartBookingProcessMutation();

    useEffect(() => {
        if (isLoading) {
            show();
        } else {
            hide();
        }
    }, [isLoading]);

	const optionSelected = useMemo(() => {
		if (!course) return null;
		const option = course.priceOptions.find((opt) => opt.numberSlots === selectedSlotsIds.length);
		return option ? option : null;
	}, [selectedSlotsIds, course]);

	const canContinue = useMemo(() => {
		if (current === 0) return course && optionSelected
		return true;
	}, [current, course, optionSelected]);

	console.log(selectedSlotsIds)
	const selectedSlots = useMemo(() => {
		return selectedSlotsIds.map(id => course?.slots.find(slot => slot._id === id))
	}, [selectedSlotsIds, course])

	if (!course) {
		return <Card>Loading...</Card>
	}

	const handleStartBooking = async () => {
		try {
			const bookingData = {
				userId,
				courseId: course.id,
				slotIds: selectedSlotsIds,
			};
			const result = await startBookingProcess(bookingData);

			// Handle result (e.g., proceed to payment)
			// return order ID
			console.log("Booking started: ", result);
			return result.orderID;
		} catch (err) {
			console.error("Failed to start booking process: ", err);
			throw new Error(`Failed to start booking process: ${err.message}`);
		}
	};

	const handleRestoreReservation = () => {
		// TODO: Implement restore reservation logic
		console.log("Restoring reservation:", activeReservation);
		setSelectedSlotsIds(activeReservation.slots);
		setCurrent(1); // Go to payment step
		setIsReservationActive(true);
		setIsReservationModalOpen(false);
	};

	const handleCancelReservation = () => {
		// TODO: Implement cancel reservation logic
		console.log("Cancelling reservation:", activeReservation);
		cancelActiveReservation(activeReservation.id);
		setIsReservationModalOpen(false);
	};

	return (
		<>
			{/* Step indicator */}
			<Steps
				current={current}
				items={steps}
				style={{ marginBottom: 24 }}
			/>

			{/* Active Reservation Modal */}
			<Modal
				title="Active Reservation Found"
				open={isReservationModalOpen}
				onCancel={() => setIsReservationModalOpen(false)}
				footer={[
					<Button
						key="cancel"
						onClick={handleCancelReservation}
					>
						Cancel Reservation
					</Button>,
					<Button
						type="primary"
						key="restore"
						onClick={handleRestoreReservation}
					>
						Restore Reservation
					</Button>,
				]}
			>
				<p>You have an active reservation for this course.</p>
				<p>Would you like to restore it or start a new booking?</p>
			</Modal>

			{/* Step content */}
			{current === 0 && (
				<StepSelect
					selectedSlotsIds={selectedSlotsIds}
					setSelectedSlotsIds={setSelectedSlotsIds}
					course={course}
				/>
			)}

			{current === 1 && <StepReview selectedSlots={selectedSlots} course={course} />}

			{current === 2 && <StepPayment
				selectedSlots={selectedSlots}
				course={course}
				optionSelected={optionSelected}
				onPaymentInitiated={handleStartBooking}
				/>}

			{/* Sticky / bottom guide */}
			<SelectionGuide
				step={current}
				selectedSlots={selectedSlots}
				canContinue={canContinue}
				optionSelected={optionSelected}
				canGoBack={current > 0 && !(isReservationActive && current === 1)}
				setSelectedSlotsIds={setSelectedSlotsIds}
				onStartBooking={handleStartBooking}
				onNext={() => {
					if (current === 1 && isInitial) {
						dispatch({ type: "setLoadingStatus", value: "pending" })
					}
					setCurrent((s) => s + 1)
				}}
				onBack={() => setCurrent((s) => s - 1)}
			/>
		</>
	);
}
