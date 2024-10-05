import { Card } from "@/components/ui/card"
import { NewAgentForm } from "./NewAgentForm"
import { useState } from "react"
import { PlusIcon } from "lucide-react"
import { trackAddNewAgentClicked } from "@/analytics";

interface NewAgentProps {
  refetchAgents: () => void
}

export function NewAgent({ refetchAgents }: NewAgentProps) {
  const [showForm, setShowForm] = useState(false)

  const hideFormAndRefetchAgents = () => {
    setShowForm(false)
    refetchAgents()
  }

  const handleAddNewAgentClick = () => {
    setShowForm(true)
    trackAddNewAgentClicked();
  }

  return (
    <Card
      className={
        showForm
          ? "border-solid"
          : "p-4 border-2 hover:border-muted-foreground/50 text-muted-foreground hover:text-foreground hover:bg-muted/15 border-dashed shadow-none light transition-all"
      }
      onClick={!showForm ? handleAddNewAgentClick : undefined}
    >
      {showForm ? (
        <NewAgentForm
          onCancel={() => setShowForm(false)}
          onSuccess={hideFormAndRefetchAgents}
        />
      ) : (
        <div className="flex h-full items-center justify-center">
          <PlusIcon className="inline-block mr-2" />
          Add New Agent
        </div>
      )}
    </Card>
  );
}