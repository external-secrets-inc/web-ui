import { trackAgentDeleteDialogOpened, trackYamlDialogOpened } from "@/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogPortal, DialogTrigger } from "@radix-ui/react-dialog";
import { FileTerminalIcon, LucideAlertCircle, LucideCheckCircle, LucideTrash2, LucideXCircle, Menu, Trash2Icon } from "lucide-react";
import React, { useEffect, useState } from 'react';
import { DeleteAgentModalContent } from "./DeleteAgentModalContent";
import { PreviewYAMLContent } from "./PreviewYAMLContent";

interface AgentDropdownProps {
  onPreviewYaml: () => void;
  onDelete: () => void;
}

const AgentDropdown: React.FC<AgentDropdownProps> = ({ onPreviewYaml, onDelete }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          className={`
            absolute top-4 right-4 transition-opacity
            ${isOpen
              ? 'opacity-100'
              : 'opacity-0 group-focus-within:opacity-100 group-hover:opacity-100'
            }
          `}
          variant="ghost"
          size="icon"
          onClick={(event) => event.stopPropagation()}
        >
          <Menu />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(event) => event.stopPropagation()}
        onCloseAutoFocus={(event) => event.preventDefault()}
      >
        <DropdownMenuItem onSelect={onPreviewYaml}>
          <FileTerminalIcon className="mr-2" />
          Preview YAML
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={onDelete}>
          <Trash2Icon className="mr-2" />
          Delete
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

interface ShowAgentProps {
  id: string;
  agentName: string;
  currentStatus: string;
  onDeleted: () => void;
}

export function AgentDetailsDialog({ id, agentName, currentStatus, onDeleted }: ShowAgentProps) {
  const isPending = ['PENDING_REGISTRATION', 'PROVISIONING'].includes(currentStatus.toUpperCase());
  const [isYamlDialogOpen, setIsYamlDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeContentTab, setActiveContentTab] = useState('details');

  const statusMap: { [key: string]: { text: string, icon: React.ReactNode } } = {
    "PROVISIONING": {
      text: "Provisioning",
      icon: <LucideAlertCircle className="text-orange-500"/>
    },
    "PENDING_REGISTRATION": {
      text: "Pending Registration",
      icon: <LucideAlertCircle className="text-orange-500"/>
    },
    "ACTIVE": {
      text: "Active",
      icon: <LucideCheckCircle className="text-green-700" />
    },
    "OFFLINE": {
      text: "Offline",
      icon: <LucideXCircle className="text-muted-foreground" />
    },
    "PENDING_DELETION": {
      text: "Pending Deletion",
      icon: <LucideTrash2 className="text-destructive"/>
    },
    "DELETED": {
      text: "Deleted",
      icon: <LucideAlertCircle className="text-destructive"/>
    }
  };
  const status = statusMap[currentStatus] || { text: currentStatus, icon: null };

  useEffect(() => {
    if (isYamlDialogOpen) {
      trackYamlDialogOpened(id, agentName);
    }
  }, [isYamlDialogOpen]);

  useEffect(() => {
    if (isDeleteDialogOpen) {
      trackAgentDeleteDialogOpened(id, agentName);
    }
  }, [isDeleteDialogOpen]);

  const handleYamlDialogOpenChange = (isOpen: boolean) => {
    setIsYamlDialogOpen(isOpen);
    if (!isOpen) {
      setActiveContentTab('details');
    }
  };

  return (
    <>
      <Dialog open={isYamlDialogOpen} onOpenChange={handleYamlDialogOpenChange}>
        <DialogTrigger asChild>
          <Card className="group flex flex-col relative hover:border-muted-foreground/50 hover:bg-muted/15 transition-all" asChild>
            <div>
              <CardHeader className="text-left">
                <CardTitle className="flex">
                  <div className="grow">{agentName}</div>
                    <AgentDropdown
                      onPreviewYaml={() => setIsYamlDialogOpen(true)}
                      onDelete={() => setIsDeleteDialogOpen(true)}
                    />
                </CardTitle>
                <div className="text-sm text-slate-500"> {id} </div>
              </CardHeader>
              <CardFooter className='mt-auto gap-1 flex-wrap-reverse'>
                  <span className='flex gap-2 items-center'>
                    {status.icon}
                    {status.text}
                  </span>
                  {isPending && <span className='text-sm text-muted-foreground'> (You need to apply it)</span>}
              </CardFooter>
            </div>
          </Card>
        </DialogTrigger>
        <PreviewYAMLContent
          id={id}
          onDeleted={onDeleted}
          agentName={agentName}
          status={status}
          activeTab={activeContentTab}
          setActiveTab={setActiveContentTab}
        />
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogPortal>
          <DialogContent>
            <DeleteAgentModalContent id={id} onDeleted={onDeleted} />
          </DialogContent>
        </DialogPortal>
      </Dialog>
    </>
  );
};
