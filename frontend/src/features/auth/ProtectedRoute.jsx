import { Navigate, Outlet } from "react-router";
import { useCheckMeQuery } from "./authApiSlice";
import { useEffect } from "react";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const ProtectedRoute = () => {
    const { data, isLoading } = useCheckMeQuery();
    const [show, hide] = useGlobalSpinner();

    // useEffect(() => {
    //     if (isLoading) {
    //         show();
    //     } else {
    //         hide();
    //     }
    // }, [isLoading]);

    if (isLoading) return <Spin spinning={isLoading} fullscreen tip="Loading..." />

    if (!data?.authenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;