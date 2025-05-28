import ListAgents from "@/components/Agents/ListAgents";
import { LayoutPage } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";

export function AgentsPage() {
  return (
    <LayoutPage
      title="Agents"
      description={
        <>
          Agents deploy, maintain, and configure External Secrets Operator
          installations for you
          <br />
          See our{" "}
          <a href={`${DOCS_DOMAIN}/docs/esi-agent/quickstart`}>
            Quickstart guide
          </a>{" "}
          and{" "}
          <a href={`${DOCS_DOMAIN}/docs/esi-for-eso/quickstart`}>
            Exclusive Features
          </a>{" "}
          for more details
        </>
      }
    >
      <ListAgents />
    </LayoutPage>
  );
}
