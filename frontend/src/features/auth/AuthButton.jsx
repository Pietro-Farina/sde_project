import { Button } from "antd";
import { useCheckMeQuery, useLogoutMutation, useTestMutation } from "./authApiSlice";
import { useNavigate } from "react-router";
import { useEffect } from "react";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const AuthButton = () => {
    const [logout, { isLoading }] = useLogoutMutation();
    const { data, isLoading: isMeLoading } = useCheckMeQuery();
    const [test] = useTestMutation();

    const navigate = useNavigate();
    const { show, hide } = useGlobalSpinner();

    useEffect(() => {
        if (isLoading || isMeLoading) {
            show();
        } else {
            hide();
        }
    }, [isLoading, isMeLoading]);

    return (
        <>
            {data?.authenticated ? (
                <Button onClick={async () => {
                    await logout();
                    navigate("/");
                }}>
                    Logout
                </Button>
            )
                :
                (
                    <Button onClick={async () => {
                        navigate("/login");
                    }}>
                        Login
                    </Button>
                )
            }
            <Button onClick={async () => {
                fetch("http://localhost:3000/__test/check-cookie", {
                    credentials: "include",
                })
                    .then(r => r.json())
                    .then(console.log);
            }}>
                Test Cookie
            </Button>
        </>
    );
}

export default AuthButton;