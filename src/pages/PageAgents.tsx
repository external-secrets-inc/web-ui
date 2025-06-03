import ListAgents from "@/components/Agents/ListAgents";
import { LayoutPage } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";
import { LucideExternalLink } from "lucide-react";

export function PageAgents() {
  const docsLink = `${DOCS_DOMAIN}/docs/enterprise/externalsecrets/esi-agent/quickstart`;

  return (
    <LayoutPage
      title="Agents"
      description={
        <>
          Agents deploy, maintain, and configure External Secrets Operator
          installations for you.
          <br />
          <a href={docsLink} target="_blank">
            Quickstart guide
            <LucideExternalLink className="inline ml-1" />
          </a>
        </>
      }
    >
      <ListAgents />
    </LayoutPage>
  );
}
