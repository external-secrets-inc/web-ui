import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@radix-ui/react-label"
import { AlertOctagon, AlertOctagonIcon, BanIcon, CheckCircle2Icon, Loader2Icon, Trash2Icon } from "lucide-react"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"

const PROVISIONING="PROVISIONING"
const PENDING_REGISTRATION="PENDING_REGISTRATION"
const ACTIVE="ACTIVE"
const OFFLINE="OFFLINE"
const PENDING_DELETION="PENDING_DELETION"
const DELETED="DELETED"

export function MapStatusToIcon({ status }) {
    switch (status.toUpperCase()) {
    case PROVISIONING:
    case PENDING_REGISTRATION:
      return <Loader2Icon className="text-sm"/>
    case ACTIVE:
      return <CheckCircle2Icon />
    case OFFLINE:
      return <AlertOctagonIcon />
    case PENDING_DELETION:
    case DELETED:
      return <BanIcon/>
    default:
        break;
    }
}
