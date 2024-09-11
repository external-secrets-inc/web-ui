import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { TrashIcon, UserIcon } from "lucide-react";
import { DropdownMenuShortcut } from "../ui/dropdown-menu";
import { ButtonIcon, HamburgerMenuIcon } from "@radix-ui/react-icons";
import axios from "axios";
import { DeleteAgentDialog } from "./DeleteAgentDialog";
import { ShowAgentExtraActions } from "./ShowAgentExtraActions";
import { PreviewYamlDialog } from "./PreviewYAMLDialog";

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

function UnregisteredBody({ id, onDeleted }) {
  return (
    <div>
      <CardContent>
        <div className="font-semibold text-sm mb-3">Copy the YAML Manifest for this agent and apply it to your cluster. This card will update upon activation.</div>
        <div className="text-sm text-slate-500">Waiting for deployment...</div>
      </CardContent>
      {/** Map statuses to icons */}
      <CardFooter className="flex justify-between">
        <DeleteAgentDialog id={id} onDeleted={onDeleted} showIcon={false} variant="ghost"/>
        <PreviewYamlDialog id={id} />
      </CardFooter>
    </div>
  )
}


  export function ShowAgent({ id, agentName, enabled, currentStatus, tags, onDeleted }) {
    const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(currentStatus)

    return (
      <Card className="text-left">
        <CardHeader className="text-left">
          <CardTitle className="flex" >
            <div className="grow flex">
            <div>{agentName}</div>
            <div>{currentStatus}</div>
            </div>
            {!isPending && <ShowAgentExtraActions id={id} onDeleted={onDeleted}/>}
          </CardTitle>
          <div className="text-sm text-slate-500"> {id} </div>
        </CardHeader>
        {isPending && <UnregisteredBody id={id} onDeleted={onDeleted}/>}
      </Card>
    )
  }
