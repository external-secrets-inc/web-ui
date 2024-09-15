import { getAgents } from "@/services/agents/agentsService";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewAgent } from "./NewAgent";
import { ShowAgent } from "./ShowAgent";
import { Agent } from "@/types";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';

interface IUserData {
 tenant: string;
 tenantID: string;
};


export function ListAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { org } = useParams<{ org: string }>(); // Extract org (tenant) from the URL
  const authUser = useAuthUser<IUserData>(); // Get the function that returns the user state
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      const tenant = authUser?.tenant; // Retrieve tenant from user state
      
      // If tenant doesn't match org from URL, redirect to not-found
      if (tenant !== org) {
        console.warn(`Org in URL (${org}) does not match tenant from userState (${tenant})`);
        navigate('/not-found', { replace: true });
        return;
      }

      // If the tenant matches, fetch the agents
      if (tenant) {
        const agentsData = await getAgents();
        setAgents(agentsData);
      }
    };

    fetchAgents();
  }, [org, navigate, authUser]); // You don't need `tenant` in the dependency array, use authUser instead

  const removeDeletedAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  return (
    <div className="max-w-[1200px] px-6 lg:px-14 mx-auto box-content text-left flex flex-col py-14">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Your Agents for {org}</h1> {/* Show the org in the UI */}
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