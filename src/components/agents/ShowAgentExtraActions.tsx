import {
  Cloud,
  CreditCard,
  FileTerminalIcon,
  Github,
  Keyboard,
  LifeBuoy,
  LogOut,
  Mail,
  MessageSquare,
  Plus,
  PlusCircle,
  Settings,
  Trash2Icon,
  User,
  UserPlus,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PreviewYamlContent } from "./PreviewYAMLContent"
import { Dialog, DialogTrigger } from "../ui/dialog"
import { DeleteAgentModalContent } from "./DeleteAgentModalContent"
import { useState } from "react"
import { DialogContent } from "@radix-ui/react-dialog"
import { ButtonIcon, HamburgerMenuIcon } from "@radix-ui/react-icons"

const YAML = 'YAML'
const DELETE = 'DELETE'

export function ShowAgentExtraActions({id, onDeleted}) {
  const [selected, setSelected] = useState('')
  const previewYamlBtn = <DropdownMenuItem>
    <DialogTrigger asChild>
      <DropdownMenuItem onClick={() => setSelected(YAML)}>
        <span>Preview YAML</span>
        <FileTerminalIcon />
      </DropdownMenuItem>
    </DialogTrigger>
  </DropdownMenuItem>

  const deleteBtn = <DropdownMenuItem>
    <DialogTrigger asChild>
      <DropdownMenuItem onClick={() => setSelected(DELETE)} className="flex justify-between">
        <div className="grow">Delete</div>
        <Trash2Icon />
      </DropdownMenuItem>
    </DialogTrigger>
  </DropdownMenuItem>

  return (
    <Dialog className="cursor-pointer" >
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant={"ghost"}><HamburgerMenuIcon/></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {previewYamlBtn}
          {deleteBtn}
        </DropdownMenuContent>
      </DropdownMenu>
      <DialogContent>
      {selected === YAML && <PreviewYamlContent id={id} />}
      {selected === DELETE && <DeleteAgentModalContent id={id} onDeleted={onDeleted}/>}
      </DialogContent>
    </Dialog >
  )
}
