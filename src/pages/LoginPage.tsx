import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/Api";
import { AuthApi } from "../api/AuthApi";
import { AppCard } from "../components/common/AppCard";

export function LoginPage() {

    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event: React.SubmitEvent<HTMLFormElement>) => {

        event.preventDefault();
        setErrorMessage(null);

        if (!username.trim() || !password) {
            setErrorMessage("用户名和密码不能为空。");
            return;
        }

        setLoading(true);
        try {
            await AuthApi().login({ username, password }, { silent: true });
            navigate("/admin");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.result.body || "登录失败，请稍后重试。");
            } else {
                setErrorMessage("登录失败，请稍后重试。");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-dvh flex justify-center items-center">
            <AppCard className="min-w-80 sm:min-w-100 p-5">
                <div className="flex flex-col gap-3">
                    <div className="flex justify-center items-center">
                        <img src="/favicon.svg" alt="Login Icon" width={100} height={100} />
                    </div>
                    <Typography color="primary" sx={{ textAlign: "center", fontSize: "1.5rem" }}>登陆到控制台</Typography>
                    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
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
                </div>
            </AppCard>
        </div>
    );
}