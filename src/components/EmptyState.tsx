import BoxIcon from "../assets/icons/BoxIcon";
import { IconText } from "./IconText";

export function EmptyState({ tip, className }: { tip: string, className?: string }) {
    return <IconText text={tip} Icon={BoxIcon} color="primary" className={className} />
}