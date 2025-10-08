import type { AuthorizationData } from "./Authorizations.interfaces";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import { DetailsCard } from "@/components/ui/DetailsCard";
import {
  LucideBookKey,
  LucideAtom,
  LucideCaseLower,
  LucideShieldCheck,
  LucideListChecks,
} from "lucide-react";

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
    <div>
      <div className="space-y-8">
        <DetailsCard
          icon={LucideListChecks}
          title="Allowed Resources"
          fields={[
            {
              icon: LucideBookKey,
              label: "Cluster Secret Stores",
              value: authorization.allowedClusterSecretStores?.length ? (
                <span className="font-mono break-all">
                  {authorization.allowedClusterSecretStores.join(", ")}
                </span>
              ) : (
                <span className="text-muted-foreground italic">None</span>
              ),
            },
            {
              icon: LucideAtom,
              label: "Generators",
              value: authorization.allowedGenerators?.length ? (
                <span className="font-mono break-all">
                  {authorization.allowedGenerators
                    .map((g) => `${g.kind}/${g.name}`)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-muted-foreground italic">None</span>
              ),
            },
            {
              icon: LucideCaseLower,
              label: "Generator States",
              value: authorization.allowedGeneratorStates?.length ? (
                <span className="font-mono break-all">
                  {authorization.allowedGeneratorStates
                    .map((s) => s.namespace)
                    .join(", ")}
                </span>
              ) : (
                <span className="text-muted-foreground italic">None</span>
              ),
            },
            ...(isNonEmptyObject(authorization.subject?.oidc)
              ? [
                  {
                    icon: LucideShieldCheck,
                    label: "OIDC Issuer",
                    value: (
                      <span className="font-mono break-all">
                        {authorization.subject.oidc.issuer}
                      </span>
                    ),
                  },
                  {
                    icon: LucideShieldCheck,
                    label: "OIDC Subject",
                    value: (
                      <span className="font-mono break-all">
                        {authorization.subject.oidc.subject}
                      </span>
                    ),
                  },
                ]
              : []),
            ...(isNonEmptyObject(authorization.subject?.spiffe)
              ? [
                  {
                    icon: LucideShieldCheck,
                    label: "Spiffe ID",
                    value: (
                      <span className="font-mono break-all">
                        {authorization.subject.spiffe.spiffeID}
                      </span>
                    ),
                  },
                ]
              : []),
          ]}
        />
      </div>
      <div className="mb-4">
        <Accordion className="mb-4" type="single" collapsible>
          <AccordionItem value="manifest">
            <AccordionTrigger className="font-bold text-base">
              Manifest Spec
            </AccordionTrigger>
            <AccordionContent>
              <CodeTextarea
                className="max-h-72 !overflow-auto"
                language="yaml"
                value={yamlString}
                disabled
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
