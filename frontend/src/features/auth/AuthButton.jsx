import { Avatar, Button } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useCheckMeQuery, useLogoutMutation } from "./authApiSlice";
import { useNavigate } from "react-router";
import { useEffect, useMemo } from "react";
import { useGlobalSpinner } from "../../app/providers/GlobalSpinnerProvider";

const AuthButton = () => {
    const [logout, { isLoading }] = useLogoutMutation();
    const { data, isLoading: isMeLoading } = useCheckMeQuery();

    const navigate = useNavigate();
    const { show, hide } = useGlobalSpinner();

    useEffect(() => {
        if (isLoading || isMeLoading) {
            show();
        } else {
            hide();
        }
    }, [isLoading, isMeLoading]);
    console.log("AuthButton render, data:", data);

    const avatarComponent = useMemo(() => {
        if (!data?.authenticated || !data?.picture) return null;
        return (
            <Avatar 
                src={data.picture}
                icon={<UserOutlined />}
                alt="User profile"
                style={{ marginRight: 8 }}
            />
        );
    }, [data?.picture, data?.authenticated]);

    return (
        <>
            {data?.authenticated ? (
                <>
                    {avatarComponent || <Avatar icon={<UserOutlined />} style={{ marginRight: 8 }} />}
                    <Button onClick={async () => {
                        await logout();
                        // we should invalidate all cached data here and redirect to home
                        navigate("/");
                    }}>
                        Logout
                    </Button>
                </>
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
        </>
    );
}

export default AuthButton;