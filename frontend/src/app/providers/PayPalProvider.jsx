import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function PayPalProvider({ children }) {
    return (
        <PayPalScriptProvider
            deferLoading={true}
            options={{
                "client-id": import.meta.env.VITE_PAYPAL_CLIENT_ID,
                currency: "EUR",
                "disable-funding": "paylater,ideal,sofort,mybank"
            }}
        >
            {children}
        </PayPalScriptProvider>
    );
}


    
