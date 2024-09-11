import axios from 'axios';
import { useEffect, useState } from "react";
import { NewAgent } from "./NewAgent";
import { ShowAgent } from "./ShowAgent";

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

export function ListAgents() {
  const [agents, setAgents] = useState([])

  useEffect(() => getAgents(), [])
  const getAgents = () => {
      axios.get(URL, {
          headers: {
            Authorization: BEARER_TOKEN,
            'Content-Type': 'application/json'
          },
        }
      ).then(({data}) => {
        const result = data.agents.map(agent => ({ ...agent, agentName: agent.name, currentStatus: agent.current_status }))
        setAgents(result)
      })
  }

  const removeDeletedAgent = (id) => {
    setAgents(agents.filter(agent => agent.id !==id))
  }

  return (
    <div className="text-left flex flex-col">
      <div className="mb-5">

      <h1 className="text-xl font-bold">Your Agents</h1>
      <div className="text-slate-500">Monitor existing agents and/or generate new ones</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <NewAgent refetchAgents={() => getAgents(true)}/>
        {agents.map((agent) => <ShowAgent key={agent.id} {...agent} onDeleted={() => removeDeletedAgent(agent.id)}/>)}

      </div>
    </div>
  )
}
