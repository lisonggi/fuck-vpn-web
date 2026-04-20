import { Button, TextField, useTheme } from "@mui/material";
import { useState } from "react";
import { useModal } from "../hooks/useModal";
import { AcitonCard } from "../components/AcitonCard";
import { AppWindow } from "../components/AppWindow";
import { AppIconButton } from "../components/AppIconButton";
import { CloseIcon } from "../assets/icons/Icons";
import { LoadingIconButtion } from "../components/LoadingIconButtion";
function ModalContent({ remove }: { remove: () => void }) {
    const modal = useModal()
    const [str, setStr] = useState("")
    const handelRepeatClick = () => {
        modal.open(({ remove }) => (
            <ModalContent remove={remove} />
        ))
    }
    return (
        <div className=" bg-yellow-50 p-3 flex flex-col gap-3">
            <TextField
                value={str}
                onChange={(e) => setStr(e.target.value)}
                label="测试编辑框"
            />
            <Button variant="contained" onClick={handelRepeatClick}>
                再开一个
            </Button>
            <Button variant="contained" onClick={remove}>
                卸载模态框
            </Button>
        </div>
    )
}


export function TestPage() {

    const modal = useModal()

    function handelOpenModalClick() {
        modal.open(({ remove }) => (
            <ModalContent remove={remove} />
        ))
    }
    async function LoadingIconButtionAClick() {
        console.log("123")
        await new Promise(resolve => setTimeout(resolve, 3000)) // 1秒
    }
    const theme = useTheme()
    return <div className="h-dvh w-dvw p-10">
        <AcitonCard acitonBarProps={{ title: "标题" }}>
            <div className="h-100 w-100">This Is Content</div>
        </AcitonCard>
        <AppWindow title={"窗口"} closeWindow={{
            onClose: function (): void {
                throw new Error("Function not implemented.");
            },
            disabled: false
        }} >
            <div>123</div>
            <AppIconButton onClick={() => { alert("") }} icon={CloseIcon} tip={"关闭"} sx={{ color: theme.palette.primary.main, fontSize: "50px" }}></AppIconButton>
        </AppWindow>
        <LoadingIconButtion iconSize="50px" sx={{ color: theme.palette.primary.main }} onClick={() => LoadingIconButtionAClick()} />
        <Button onClick={() => handelOpenModalClick()}>打开模态框</Button>
    </div>
}