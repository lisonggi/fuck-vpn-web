import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useModal } from "../hooks/useModal";
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
    fetch("/api/testGet", {
        method: "GET",
    }).then((response) => {
        console.log("testGetStatus", response.status)
    }).catch((err) => {
        if (err instanceof Error) {
            console.log(err.message)
        }
    })

    fetch("/api/testPost", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
    }).then((response) => {
        console.log("testPostStatus", response.status)
    }).catch((err) => {
        if (err instanceof Error) {
            console.log(err.message)
        }
    })

    const modal = useModal()

    function handelClick() {
        modal.open(({ remove }) => (
            <ModalContent remove={remove} />
        ))
    }

    return <div className="h-dvh w-dvw">
        <Button onClick={() => handelClick()}>打开模态框</Button>
    </div>
}