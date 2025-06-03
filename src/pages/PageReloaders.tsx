import ListRotators from "@/components/Rotators/ListRotators";
import { LayoutPage } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";
import { LucideExternalLink } from "lucide-react";

export function PageReloaders() {
  const docsLink = `${DOCS_DOMAIN}/docs/open_source/reloader/quickstart`;

  return (
    <LayoutPage
      title="Reloaders"
      description={
        <>
          External Secrets Reloaders listen for events from audit logs to trigger
          a rotation in the External Secrets Operator.
          <br />
          <a href={docsLink} target="_blank">
            Quickstart guide
            <LucideExternalLink className="inline ml-1" />
          </a>
        </>
      }
    >
      <ListRotators />
    </LayoutPage>
  );
}
