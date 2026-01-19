import React from 'react'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Card, message, Typography, Space, Button, Spin, Alert } from 'antd';
import { useNavigate } from 'react-router';

const { Title, Text } = Typography;

export const StepPayment = ({ selectedSlots, course, optionSelected, handleStartBooking, activeReservation, currentWorkingReservationId, confirmBooking, handlerError }) => {
	const [{ isInitial, isPending, isResolved, isRejected }, dispatch] = usePayPalScriptReducer();
	const navigate = useNavigate();
	console.log("PAYMENT STEP - activeReservation:", activeReservation);
	console.log("PAYMENT STEP - currentWorkingReservationId:", currentWorkingReservationId);

	return (
		<Card
			style={{
				margin: '0 auto',
			}}
		>
			<Space
				direction="vertical"
				size="large"
				style={{
					width: '100%',
					display: 'flex',
					textAlign: 'center',
					padding: '24px 0',
				}}
			>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<Title level={3}>Complete Your Payment</Title>
				</div>
				<div style={{ display: 'flex', justifyContent: 'center' }}>
					<Text type="secondary">
						Secure payment powered by PayPal
					</Text>
				</div>

				{isInitial && (
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<Button
							type="primary"
							size="large"
							onClick={() => dispatch({ type: "setLoadingStatus", value: "pending" })}
						>
							Continue to Payment
						</Button>
					</div>
				)}

				{isPending && (
					<div style={{ display: 'flex', justifyContent: 'center' }}>
						<Space direction="vertical" size="middle">
							<Spin size="large" />
							<Text>Loading PayPal payment options…</Text>
						</Space>
					</div>
				)}

				{isRejected && (
					<Alert
						message="Payment System Error"
						description="Unable to load PayPal. Please refresh the page and try again."
						type="error"
						showIcon
					/>
				)}

				{isResolved && (
					<div style={{ width: '100%', maxWidth: 500, margin: '0 auto' }}>
						<PayPalButtons
							style={{
								layout: "vertical",
								height: 55,
							}}
							createOrder={async () => {
								try {
									// handleStartBooking will use activeReservation.id internally and refetch
									console.log("Creating order, activeReservation.id:", activeReservation?.id);
									const orderID = await handleStartBooking();
									console.log("RETURNED orderID:", orderID);
									return orderID;
								} catch (err) {
									throw new Error(`Failed to create order! ${err.message}`);
								}
							}}
							onApprove={async (data) => {
								// call your backend to capture
								try {
									console.log("ON APPROVE: orderID:", data.orderID);
									//
									const res = await confirmBooking({
										orderID: data.orderID,
										reservationId: currentWorkingReservationId || activeReservation?.id
									}).unwrap();
									console.log("Booking confirmed:", res);
									const booking = res.booking;

									message.success("Payment completed successfully!");

									// REDIRECT TO SUCCESS PAGE
									navigate(`/bookings/success/${booking._id}`, {
										replace: true, // prevents going back to payment
										state: { booking },
									});
								} catch (err) {
									const userMessage = handlerError(err);
									throw new Error(`Payment capture failed: ${userMessage}`);
								}
							}}
							onError={(err) => {
								console.error(err);
								message.error(<div>Payment failed. Please try again:<br />{err.message}</div>, 10);
							}}
							onCancel={() => message.info("Payment was canceled.")}
						/>
					</div>
				)}
			</Space>
		</Card>
	)
}
