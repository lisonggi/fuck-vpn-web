import { Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import { useNavigate } from "react-router";

export function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <main className="h-dvh w-full flex flex-col justify-center items-center bg-gray-50">
            <Card className="w-xs">
                <CardHeader title="页面不存在" />
                <CardContent>
                    <Typography sx={{ color: 'text.secondary', fontSize: 18 }}>
                        你访问的这个页面不存在,请检查地址是否正确
                    </Typography>
                </CardContent>
                <CardActions>
                    <Button variant="contained" className="w-full" onClick={() => navigate(-1)}>
                        <Typography sx={{ color: 'primary.contrastText', fontSize: 14 }}>
                            返回
                        </Typography>
                    </Button>
                </CardActions>

            </Card>
        </main>
    );
}