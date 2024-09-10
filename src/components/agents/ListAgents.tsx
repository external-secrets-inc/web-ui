import axios from 'axios';
import { useState } from "react";
import { NewAgent } from "./NewAgent";
import { ShowAgent } from "./ShowAgent";

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`
const BEARER_TOKEN = `Bearer ${import.meta.env.VITE_JWT_TOKEN}`

export function ListAgents() {
  const [agents, setAgents] = useState([])

  const getAgents = (refetch = false) => {
    if (agents.length === 0 || refetch) {
      const response =  axios.get(URL, {
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
  }

  getAgents()
  
  return (
    <div className="text-left flex flex-col">
      <div className="mb-5">

      <h1 className="text-xl font-bold">Your Agents</h1>
      <div className="text-slate-500">Monitor existing agents and/or generate new ones</div>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <NewAgent refetchAgents={() => getAgents(true)}/>
        {agents.map((agent) => <ShowAgent key={agent.id} {...agent} />)}

      </div>
    </div>
  )
}
