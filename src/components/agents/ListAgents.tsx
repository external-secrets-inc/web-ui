import { getAgents } from "@/services/agents/agentsService";
import { useEffect, useState } from "react";
import { NewAgent } from "./NewAgent";
import { ShowAgent } from "./ShowAgent";
import { Agent } from "@/types";

export function ListAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);

  useEffect(() => {
    const fetchAgents = async () => {
      const agentsData = await getAgents();
      setAgents(agentsData);
    };
    fetchAgents();
  }, []);

  const removeDeletedAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  return (
    <div className="max-w-[1200px] px-6 lg:px-14 mx-auto box-content text-left flex flex-col py-14">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Your Agents</h1>
        <div className="text-slate-500">Monitor existing agents and/or generate new ones</div>
      </div>
      <div className="grid grid-cols-3 auto-rows-[minmax(216px,auto)] gap-4">
        <NewAgent refetchAgents={async () => {
          const agentsData = await getAgents();
          setAgents(agentsData);
        }} />
        {agents.slice().reverse().map((agent) => (
          <ShowAgent
            key={agent.id}
            id={agent.id}
            agentName={agent.name}
            currentStatus={agent.current_status}
            onDeleted={() => removeDeletedAgent(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
