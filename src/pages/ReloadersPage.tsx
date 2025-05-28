import ListRotators from "@/components/Rotators/ListRotators";
import { LayoutPage } from "@/components/layout";
import { DOCS_DOMAIN } from "@/constants";

export function ReloadersPage() {
  return (
    <LayoutPage
      title="Reloaders"
      description={
        <>
          Reloaders listen for events from audit logs to trigger a rotation in
          the External Secrets Operator
          <br />
          See our{" "}
          <a href={`${DOCS_DOMAIN}/docs/esi-async-rotator/quickstart`}>
            Quickstart guide
          </a>{" "}
          for more details
        </>
      }
    >
      <ListRotators />
    </LayoutPage>
  );
}
