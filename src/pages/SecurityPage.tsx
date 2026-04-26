import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/Api";
import { AuthApi } from "../api/AuthApi";
import { AppCard } from "../components/common/AppCard";

export function SecurityPage() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        AuthApi().me()
            .then((data) => setUsername(data.username))
            .catch(() => {
                // ignore, user can still type in username manually
            });
    }, []);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setErrorMessage(null);
        setSuccessMessage(null);

        if (!username.trim() || !password) {
            setErrorMessage("用户名和密码不能为空。");
            return;
        }

        setLoading(true);
        try {
            await AuthApi().updateConfig({ username: username.trim(), password });
            setSuccessMessage("修改成功，请重新登录以应用新的身份信息。");
            await AuthApi().logout();
            navigate("/login");
        } catch (error) {
            if (error instanceof ApiError) {
                setErrorMessage(error.result.body || "修改失败，请稍后重试。");
            } else {
                setErrorMessage("修改失败，请稍后重试。");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex justify-center items-center py-8">
            <AppCard className="min-w-80 sm:min-w-100 p-5">
                <div className="flex flex-col gap-3">
                    <Typography color="primary" sx={{ textAlign: "center", fontSize: "1.5rem" }}>
                        修改用户名与密码
                    </Typography>
                    <Box component="form" onSubmit={handleSubmit} className="flex flex-col gap-3">
                        {errorMessage && <Alert severity="error">{errorMessage}</Alert>}
                        {successMessage && <Alert severity="success">{successMessage}</Alert>}
                        <TextField
                            label="新用户名"
                            variant="outlined"
                            size="small"
                            value={username}
                            onChange={(event) => setUsername(event.target.value)}
                            fullWidth
                            required
                            helperText="请输入新用户名或保留当前用户名。"
                        />
                        <TextField
                            label="新密码"
                            type="password"
                            size="small"
                            variant="outlined"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            fullWidth
                            required
                            helperText="请输入新密码。"
                        />
                        <Button type="submit" variant="contained" size="large" disabled={loading} fullWidth>
                            {loading ? "保存中..." : "保存"}
                        </Button>
                    </Box>
                </div>
            </AppCard>
        </div>
    );
}