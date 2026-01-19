import { Steps, Card, Modal, Button, message } from "antd";
import { useState, useMemo, useEffect, use } from "react";
import { SelectionGuide } from "./SelectionGuide";
import { StepSelect } from "./StepSelect";
import { StepReview } from "./StepReview";
import { StepPayment } from "./StepPayment";
import { useSlots } from "../../hooks/useSlots";
import { useParams } from "react-router";
import { useGetCourseByIdQuery } from "../courses/coursesApiSlice";
import { useStartBookingProcessMutation, useGetActiveReservationQuery, useCancelActiveReservationMutation, useConfirmBookingMutation } from "./bookingApiSlice";
import { usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const steps = [{ title: "Select" }, { title: "Review" }, { title: "Payment" }];

export default function CourseBookingPage() {
	const [current, setCurrent] = useState(0);
	const [selectedSlotsIds, setSelectedSlotsIds] = useState([]);
	const [isReservationModalOpen, setIsReservationModalOpen] = useState(false);
	const [isReservationActive, setIsReservationActive] = useState(false);
	const [currentWorkingReservationId, setCurrentWorkingReservationId] = useState(null);
	const [{ isInitial }, dispatch] = usePayPalScriptReducer();
	const { slots } = useSlots()

	// id corso
	const { id } = useParams();

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
		refetch: refetchActiveReservation,
	} = useGetActiveReservationQuery({ courseId: id }, { skip: !id });

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

	// Update currentWorkingReservationId when activeReservation changes
	useEffect(() => {
		if (activeReservation?.id && activeReservation.id !== currentWorkingReservationId && current === 2) {
			// We're on payment step and have a fresh reservation - track it
			setCurrentWorkingReservationId(activeReservation.id);
		}
	}, [activeReservation, current]);

	// Handle the reservation result one time
	useEffect(() => {
		if (activeReservationIsSuccess && activeReservation) {
			console.log("Active reservation found:", activeReservation);
			// Only show modal if it's a different reservation (e.g., after page refresh)
			// AND we're not already on the payment step
			if (activeReservation.id !== currentWorkingReservationId && current !== 2) {
				setIsReservationModalOpen(true);
			}
		}
		if (activeReservationIsError) {
			console.error("Error checking reservation:", activeReservationError);
			// Handle error (e.g., user has no active reservation)
		}
	}, [activeReservationIsSuccess, activeReservationIsError, activeReservation, currentWorkingReservationId, current]);

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

	const [
		confirmBooking,
		{
			data: confirmationData,
			isLoading: isConfirmationLoading,
			isSuccess: isConfirmationSuccess,
			isError: isConfirmationError,
			error: confirmationError,
		}
	] = useConfirmBookingMutation();

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

	const handlerError = (error) => {
		const status = error?.status;
		const serverData = error?.data; // backend JSON when available
		const serverCode = serverData?.error?.code;
		const serverMessage = serverData?.error?.message;

		const userMessage = serverMessage || error?.error || error?.message || 'Unknown error';
		console.error('Booking failed', { status, serverCode, serverMessage, error });
		console.error('User message:', userMessage);
		// rethrow or handle
		return userMessage;
	}

	const handleStartBooking = async () => {
		try {
			const bookingData = {
				courseId: course.id,
				slotIds: selectedSlotsIds,
			};

			// If there's an active reservation, include it to reuse instead of creating new one
			if (activeReservation?.id) {
				bookingData.reservationId = activeReservation.id;
			}

			const result = await startBookingProcess(bookingData).unwrap();
			console.log("UNWRAPPED", result)

			return result.orderID;
		} catch (err) {
			const userMessage = handlerError(err);
			// Immediately refetch to update activeReservation with the new/updated reservation
			await refetchActiveReservation();
			throw new Error(`Failed to start booking process: ${userMessage}`);
		}
	};

	const handleRestoreReservation = () => {
		// TODO: Implement restore reservation logic
		console.log("Restoring reservation:", activeReservation);
		setSelectedSlotsIds(activeReservation.slots);
		setCurrentWorkingReservationId(activeReservation.id);
		setCurrent(2); // Go to payment step
		setIsReservationActive(true);
		setIsReservationModalOpen(false);
	};

	const handleCancelReservation = async () => {
		try {
			console.log("Cancelling reservation:", activeReservation);
			// await mutation and throw on error
			await cancelActiveReservation(activeReservation.id).unwrap();

			// refetch active reservation to ensure cache is updated
			if (typeof refetchActiveReservation === 'function') {
				await refetchActiveReservation();
			}

			setIsReservationModalOpen(false);
			setIsReservationActive(false);
			setCurrentWorkingReservationId(null);
		} catch (err) {
			console.error('Failed to cancel reservation:', err);
			message.error('Unable to cancel reservation. Please try again.');
		}
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
				open={isReservationModalOpen && activeReservation}
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
				handleStartBooking={handleStartBooking}
				confirmBooking={confirmBooking}
				activeReservation={activeReservation}
				currentWorkingReservationId={currentWorkingReservationId}
				handlerError={handlerError}
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
