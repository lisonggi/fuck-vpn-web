import { Box, Button, TextField, Typography } from "@mui/material";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/Api";
import { AuthApi } from "../api/AuthApi";
import { ExcitedIcon } from "../assets/icons/Icons";
import { AppCard } from "../components/common/AppCard";
import { IconText } from "../components/common/IconText";

export function LoginPage() {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [requestUsername, setRequestUsername] = useState<string>()
    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {

        event.preventDefault();
        setLoading(true);
        try {
            const config = await AuthApi().login({ username, password }, { silent: true });
            setRequestUsername(config.username)
            navigate("/admin");
        } catch (error) {
            if (error instanceof ApiError) {
                enqueueSnackbar(error.result.body, { variant: "error" })
            } else {
                enqueueSnackbar("登录失败，请稍后重试。", { variant: "error" })
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-dvh flex justify-center items-center">
            <AppCard className="min-w-80 sm:min-w-100 p-5">
                {requestUsername ? <IconText Icon={ExcitedIcon} text={`欢迎 ${requestUsername}`} /> :
                    <div className="flex flex-col gap-3">
                        <div className="flex justify-center items-center">
                            <img src="/favicon.svg" alt="Login Icon" width={100} height={100} />
                        </div>
                        <Typography color="primary" sx={{ textAlign: "center", fontSize: "1.5rem" }}>登陆到控制台</Typography>
                        <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-3">
                            <TextField
                                label="用户名"
                                variant="outlined"
                                size="small"
                                value={username}
                                onChange={(event) => setUsername(event.target.value)}
                                fullWidth
                                required
                                autoFocus
                                helperText="初始用户名为任意字符串"
                            />

                            <TextField
                                label="密码"
                                type="password"
                                size="small"
                                variant="outlined"
                                value={password}
                                onChange={(event) => setPassword(event.target.value)}
                                fullWidth
                                required
                                helperText="初始密码为任意字符串"
                            />

                            <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                                {loading ? "登录中..." : "登录"}
                            </Button>
                        </Box>
                    </div>}

            </AppCard>
        </div>
    );
}