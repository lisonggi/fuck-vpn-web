import { Button, TextField } from "@mui/material";
import { useState } from "react";
import { useModal } from "../hooks/useModal";
function ModalContent({ remove, str, onChange }: { remove: () => void, str: string, onChange: (v: string) => void }) {
    return (
        <div className=" bg-yellow-50 p-3">
            <TextField
                value={str}
                onChange={(e) => onChange(e.target.value)}
                label="测试编辑框"
            />
            <Button onClick={remove}>
                卸载模态框
            </Button>
        </div>
    )
}

export function TestPage() {
    const modal = useModal()
    const [str, setStr] = useState("")

    function handelClick() {
        const a = modal.create(({ remove }) => (
            <ModalContent remove={remove} str={str} onChange={(v) => setStr(v)} />
        ))
        a.show()
    }

    return <div className="h-dvh w-dvw">
        <Button onClick={() => handelClick()}>打开模态框</Button>
    </div>
}