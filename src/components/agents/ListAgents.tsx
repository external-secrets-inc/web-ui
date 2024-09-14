import axios from 'axios';
import { useEffect, useState } from "react";
import { NewAgent } from "./NewAgent";
import { ShowAgent } from "./ShowAgent";
import { getAuthHeaders } from '../../services/auth/authService'; // Import getAuthHeaders

const URL = `${import.meta.env.VITE_API_DOMAIN}/api/agents`;

export function ListAgents() {
  const [agents, setAgents] = useState([]);

  useEffect(() => getAgents(), []);

  const getAgents = () => {
    axios.get(URL, {
      headers: getAuthHeaders(),  // Use the centralized getAuthHeaders function
    })
    .then(({ data }) => {
      const result = data.agents.map(agent => ({
        ...agent,
        agentName: agent.name,
        currentStatus: agent.current_status
      }));
      setAgents(result);
    });
  };

  const removeDeletedAgent = (id) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  return (
    <div className="max-w-[1200px] px-6 lg:px-14 mx-auto box-content text-left flex flex-col py-14">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Your Agents</h1>
        <div className="text-slate-500">Monitor existing agents and/or generate new ones</div>
      </div>
      <div className="grid grid-cols-3 auto-rows-[180px] gap-4">
        <NewAgent refetchAgents={() => getAgents(true)} />
        {agents.slice().reverse().map((agent) => (
          <ShowAgent key={agent.id} {...agent} onDeleted={() => removeDeletedAgent(agent.id)} />
        ))}
      </div>
    </div>
  );
}