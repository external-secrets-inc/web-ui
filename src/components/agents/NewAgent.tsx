import { Card, CardHeader, CardTitle } from "../ui/card"
import { NewAgentForm } from "./NewAgentForm"
import { useState } from "react"

export function NewAgent({refetchAgents}) {
  let [showForm, setShowForm] = useState(false)

  const DefaultBehaviour = <CardHeader className="hover:cursor-pointer text-center">
  {/* Add icon here */}
    <CardTitle onClick={() => setShowForm(!showForm)} > + New Agent </CardTitle>
    </CardHeader>

  
  const hideFormAndRefetchAgents = () => {
    setShowForm(false)
    refetchAgents()
  } 

  return (
    <Card >
      {showForm ? <NewAgentForm onCancel={() =>setShowForm(false)} onSuccess={hideFormAndRefetchAgents}/>: DefaultBehaviour} 
    </Card>
  )
}
