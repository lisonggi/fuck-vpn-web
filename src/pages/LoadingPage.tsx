import { Button, Card, CardActions, CardContent, Typography } from "@mui/material";

export function LoadingPage({ isLoading, isError, onRefetch }: { isLoading: boolean, isError: boolean, onRefetch: () => void }) {
    const title = isLoading ? "加载中" : isError ? "加载失败" : ""
    return <div className="size-full flex justify-center items-center">
        <Card className="w-xs">
            <CardContent>
                <Typography>
                    {title}
                </Typography>
            </CardContent>
            {isError && <CardActions>
                <Button variant="contained" className="w-full" onClick={onRefetch}>
                    <Typography sx={{ color: 'primary.contrastText', fontSize: 14 }}>
                        重试
                    </Typography>
                </Button>
            </CardActions>}
        </Card>
    </div >
}