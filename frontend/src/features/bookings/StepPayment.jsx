import React from 'react'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Card, message } from 'antd';

export const StepPayment = ({ selectedSlots, course, optionSelected, handleStartBooking, reservationData, confirmBooking }) => {
  const [{ isInitial, isPending, isResolved, isRejected }, dispatch] = usePayPalScriptReducer();


  return (
    <Card>
      {isInitial && (
        <button
          onClick={() => dispatch({ type: "setLoadingStatus", value: "pending" })}
        >
          Load PayPal
        </button>
      )}

      {isPending && <p>Loading PayPal…</p>}
      {isRejected && <p>Error loading PayPal. Please retry.</p>}

      {isResolved && (
        <PayPalButtons
          createOrder={async () => {
            // const res = await handleStartBooking();
            // const res = await fetch("/api/paypal/create-order", { method: "POST" });
            // const data = await res.json();
            // return data.orderID;
            try {
              // const res = await fetch("/api/paypal/create-order", { method: "POST" });
              // const data = await res.json();
              // return data.orderID;

              const orderID = await handleStartBooking();
              console.log("RETURNED:", orderID)
              return orderID;
            } catch (err) {
              console.error("Failed to create order: ", err);
              throw new Error(`Failed to create order: ${err.message}`);
            }
          }}
          onApprove={async (data) => {
            // call your backend to capture
            try {
              console.log("ON APPROVE: orderID:", data.orderID);
              //
              const res = await confirmBooking({
                orderID: data.orderID, reservationId: reservationData.reservationId
              });
              console.log("Capture result:", res);
              message.success("Payment completed successfully!");
            } catch (err) {
              console.error("Payment capture failed: ", err);
              throw new Error(`Failed to create order: ${err.message}`);
            }
          }}
          onError={(err) => {
            console.error(err);
            message.error(<div>Payment failed. Please try again:<br />{err.message}</div>);
          }}
          onCancel={() => alert("Payment was canceled.")}
        />
      )}
    </Card>
  )
}
