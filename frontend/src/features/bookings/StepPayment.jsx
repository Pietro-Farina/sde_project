import React from 'react'
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";
import { Card, message } from 'antd';

export const StepPayment = ({ selectedSlots, course, optionSelected, onPaymentInitiated }) => {
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
            // const res = onPaymentInitiated();
            // const res = await fetch("/api/paypal/create-order", { method: "POST" });
            // const data = await res.json();
            // return data.orderID;
            try {
              const res = await fetch("/api/paypal/create-order", { method: "POST" });
              const data = await res.json();
              return data.orderID;
            } catch (err) {
              console.error("Failed to create order: ", err);
              throw new Error(`Failed to create order: ${err.message}`);
            }
          }}
          onApprove={async (data) => {
            // call your backend to capture
            await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderID: data.orderID })
            });
            alert("Payment successful!");
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
