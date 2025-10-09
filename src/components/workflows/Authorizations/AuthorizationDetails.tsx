import { LayoutPortalHeaderActions } from "@/components/layout";
import { CodeViewerSheet } from "@/components/ui/CodeViewerSheet";
import { DetailsCard } from "@/components/ui/DetailsCard";
import {
  LucideAtom,
  LucideBookKey,
  LucideCaseLower,
  LucideListChecks,
  LucideShieldCheck,
  LucideSquareCode,
} from "lucide-react";
import type { AuthorizationData } from "./Authorizations.interfaces";

function isNonEmptyObject<T extends object>(
  obj: T | null | undefined
): obj is T {
  return !!obj && Object.keys(obj).length > 0;
}

export function AuthorizationDetails({
  authorization,
  yamlString,
}: {
  authorization: AuthorizationData;
  yamlString: string;
}) {
  return (
    <>
      <LayoutPortalHeaderActions>
        <CodeViewerSheet
          code={yamlString}
          language="yaml"
          title="Manifest Spec"
          icon={<LucideSquareCode />}
          triggerLabel="View Manifest Spec"
          triggerIcon={<LucideSquareCode />}
          triggerVariant="secondary"
        />
      </LayoutPortalHeaderActions>

      <div>
        <div className="space-y-8">
          <DetailsCard
            icon={LucideShieldCheck}
            title="Authorization Details"
            fields={[
              {
                label: "Identity Provider",
                value: `${authorization.federationRef.name} (${authorization.federationRef.kind})`,
              },
            ]}
            sections={[
              {
                title: "Allowed Resources",
                icon: LucideListChecks,
                fields: [
                  {
                    icon: LucideBookKey,
                    label: "Cluster Secret Stores",
                    value: authorization.allowedClusterSecretStores?.length ? (
                      authorization.allowedClusterSecretStores.join(", ")
                    ) : (
                      <span className="text-muted-foreground italic">None</span>
                    ),
                  },
                  {
                    icon: LucideAtom,
                    label: "Generators",
                    value: authorization.allowedGenerators?.length ? (
                      authorization.allowedGenerators
                        .map((g) => `${g.kind}/${g.name}`)
                        .join(", ")
                    ) : (
                      <span className="text-muted-foreground italic">None</span>
                    ),
                  },
                  {
                    icon: LucideCaseLower,
                    label: "Generator States",
                    value: authorization.allowedGeneratorStates?.length ? (
                      authorization.allowedGeneratorStates
                        .map((s) => s.namespace)
                        .join(", ")
                    ) : (
                      <span className="text-muted-foreground italic">None</span>
                    ),
                  },
                  ...(isNonEmptyObject(authorization.subject?.oidc)
                    ? [
                        {
                          icon: LucideShieldCheck,
                          label: "OIDC Issuer",
                          value: authorization.subject.oidc.issuer,
                        },
                        {
                          icon: LucideShieldCheck,
                          label: "OIDC Subject",
                          value: authorization.subject.oidc.subject,
                        },
                      ]
                    : []),
                  ...(isNonEmptyObject(authorization.subject?.spiffe)
                    ? [
                        {
                          icon: LucideShieldCheck,
                          label: "Spiffe ID",
                          value: authorization.subject.spiffe.spiffeID,
                        },
                      ]
                    : []),
                ],
              },
            ]}
          />
        </div>
      </div>
    </>
  );
}
