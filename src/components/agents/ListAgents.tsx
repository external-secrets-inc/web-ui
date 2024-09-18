import { getAgents } from "@/services/agents/agentsService";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { NewAgent } from "./NewAgent";
import { AgentDetailsDialog } from "./AgentDetailsDialog";
import { Agent, IUserData } from "@/types";
import useAuthUser from 'react-auth-kit/hooks/useAuthUser';
import { toast } from "sonner";

export function ListAgents() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const { org } = useParams<{ org: string }>();
  const authUser = useAuthUser<IUserData>();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAgents = async () => {
      const tenant = authUser?.tenant;

      if (tenant !== org) {
        console.warn(`Org in URL (${org}) does not match tenant from userState (${tenant})`);
        setTimeout(() => {
          navigate(`/${tenant}/agents`, { replace: true });
          toast.error('', {description: `You have been redirected to your current organization (${tenant}).`} );
        }, 0);
      }

      if (tenant) {
        const agentsData = await getAgents();
        setAgents(agentsData);

      }
    };

    fetchAgents();
  }, [org, navigate, authUser]);

  const removeDeletedAgent = (id: string) => {
    setAgents(agents.filter(agent => agent.id !== id));
  };

  return (
    <div className="max-w-[1200px] px-6 lg:px-14 mx-auto box-content text-left flex flex-col py-14">
      <div className="mb-6">
        <h1 className="text-xl font-bold">Your Agents</h1>
        <div className="text-slate-500">Monitor existing agents and/or generate new ones</div>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(min(350px,100%),1fr))] auto-rows-[minmax(216px,auto)] gap-4">
        <NewAgent refetchAgents={async () => {
          const agentsData = await getAgents();
          setAgents(agentsData);
        }} />
        {agents.slice().reverse().map((agent) => (
          <AgentDetailsDialog
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
