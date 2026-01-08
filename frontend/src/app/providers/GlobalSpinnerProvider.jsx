import { Spin } from "antd";
import { createContext, useContext, useState } from "react";

const SpinnerContext = createContext(null);

export function GlobalSpinnerProvider({ children }) {
	const [active, setActive] = useState(false);

	const show = () => setActive(true);
    const hide = () => setActive(false);

	return (
		<SpinnerContext.Provider value={{ show, hide, active }}>
			{children}

			<Spin spinning={active} fullscreen tip="Loading..." />
		</SpinnerContext.Provider>
	);
}

export function useGlobalSpinner() {
	const ctx = useContext(SpinnerContext);
	if (!ctx) {
		throw new Error(
			"useGlobalSpinner must be used inside GlobalSpinnerProvider"
		);
	}
	return ctx;
}
