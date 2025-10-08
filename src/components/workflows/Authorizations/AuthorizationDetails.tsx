import type { AuthorizationData } from "./Authorizations.interfaces";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { BadgeGroup, type BadgeItem } from "@/components/ui/BadgeGroup";
import { CodeTextarea } from "@/components/ui/CodeTextarea";
import {
  LucideBookKey,
  LucideAtom,
  LucideCaseLower,
  LucideShieldCheck,
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
  const clusterSecretStoresBadges: BadgeItem[] =
    authorization.allowedClusterSecretStores?.map((name) => ({
      id: name,
      label: name,
      icon: LucideBookKey,
      className: "text-sm",
    })) ?? [];

  const generatorsBadges: BadgeItem[] =
    authorization.allowedGenerators?.map((g) => ({
      id: `${g.namespace}/${g.kind}/${g.name}`,
      label: g.name,
      icon: LucideAtom,
      className: "text-sm",
      children: ({ iconNode, labelNode }) => (
        <>
          {iconNode}
          {labelNode}
          <Badge variant="outline" className="text-xs -mr-1.5">
            {g.kind}
          </Badge>
        </>
      ),
    })) ?? [];

  const generatorStatesBadges: BadgeItem[] =
    authorization.allowedGeneratorStates?.map((s) => ({
      id: s.namespace,
      label: s.namespace,
      icon: LucideCaseLower,
      className: "text-sm",
    })) ?? [];

  const oidcBadges: BadgeItem[] = [];
  if (isNonEmptyObject(authorization.subject?.oidc)) {
    oidcBadges.push(
      {
        id: "oidc-issuer",
        label: authorization.subject.oidc.issuer,
        icon: LucideShieldCheck,
        className: "text-sm",
      },
      {
        id: "oidc-subject",
        label: authorization.subject.oidc.subject,
        icon: LucideShieldCheck,
        className: "text-sm",
      }
    );
  }

  const spiffeBadges: BadgeItem[] = isNonEmptyObject(
    authorization.subject?.spiffe
  )
    ? [
        {
          id: "spiffe-id",
          label: authorization.subject.spiffe.spiffeID,
          icon: LucideShieldCheck,
          className: "text-sm",
        },
      ]
    : [];

  return (
    <div>
      <div className="space-y-8">
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

        <div className="pb-4">
          <div className="mb-2 font-semibold tracking-wide text-muted-foreground text-lg">
            Allowed Resources
          </div>

          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(250px,100%),1fr))] gap-8">
            {/* Cluster Secret Stores */}
            <div className="space-y-2">
              <div className="font-bold text-base">Cluster Secret Stores</div>
              {clusterSecretStoresBadges.length > 0 ? (
                <BadgeGroup badges={clusterSecretStoresBadges} />
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>

            {/* Generators */}
            <div className="space-y-2">
              <div className="font-bold text-base">Generators</div>
              {generatorsBadges.length > 0 ? (
                <BadgeGroup badges={generatorsBadges} />
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>

            {/* Generator States */}
            <div className="space-y-2">
              <div className="font-bold text-base">Generator States</div>
              {generatorStatesBadges.length > 0 ? (
                <BadgeGroup badges={generatorStatesBadges} />
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>

            {/* OIDC */}
            {oidcBadges.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-base">Federation Subject</div>
                <div className="space-y-2">
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">
                      Issuer
                    </div>
                    <BadgeGroup badges={[oidcBadges[0]]} />
                  </div>
                  <div>
                    <div className="text-muted-foreground text-xs mb-1">
                      Subject
                    </div>
                    <BadgeGroup badges={[oidcBadges[1]]} />
                  </div>
                </div>
              </div>
            )}

            {/* Spiffe */}
            {spiffeBadges.length > 0 && (
              <div className="space-y-2">
                <div className="font-bold text-base">Spiffe ID</div>
                <BadgeGroup badges={spiffeBadges} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
