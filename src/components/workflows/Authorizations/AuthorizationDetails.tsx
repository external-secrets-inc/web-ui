import { AuthorizationData } from "./Authorizations.interfaces";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CodeTextarea } from "@/components/ui/CodeTextarea";

export function AuthorizationDetails({
  authorization,
  yamlString,
}: {
  authorization: AuthorizationData;
  yamlString: string;
}) {
  return (
    <div>
      <div className="space-y-4">
        {/* Allows */}
        <div className="border-b pb-4">
          <div className="mb-2 font-semibold tracking-wide text-muted-foreground text-lg">
            Allows
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {/* Cluster Secret Stores */}
            <div className="space-y-1">
              <div className="font-bold text-base">
                Cluster Secret Stores
              </div>
              {authorization.allowedClusterSecretStores?.length ? (
                <ul className="space-y-1">
                  {authorization.allowedClusterSecretStores.map((name) => (
                    <li key={name} className="truncate pl-4">
                      <span>{name}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>

            {/* Generators */}
            <div className="space-y-1">
              <div className="font-bold text-base">
                Generators
              </div>
              {authorization.allowedGenerators?.length ? (
                <ul className="space-y-1">
                  {authorization.allowedGenerators.map((g) => {
                    const key = `${g.namespace}/${g.kind}/${g.name}`;
                    return (
                      <li key={key} className="truncate pl-4">
                        <span>{g.name}</span>{" "}
                        <span className="text-muted-foreground">
                          ({g.kind})
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>

            {/* Generator States */}
            <div className="space-y-1">
              <div className="font-bold text-base">
                Generator States
              </div>
              {authorization.allowedGeneratorStates?.length ? (
                <ul className="space-y-1">
                  {authorization.allowedGeneratorStates.map((s) => (
                    <li key={s.namespace} className="truncate pl-4">
                      <span>{s.namespace}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="italic text-muted-foreground">—</div>
              )}
            </div>
          </div>
        </div>

        {(authorization.subject || authorization.spiffe) && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 border-b pb-4">
  {/* Federation Subject */}
  {authorization.subject && (
    <div
      className={`min-w-0 ${
        authorization.spiffe ? "" : "md:col-span-2"
      }`}
    >
      <div className="mb-1 font-bold text-base">Federation Subject</div>

      <div className="pl-4 flex items-baseline gap-1 min-w-0">
        <span className="text-muted-foreground shrink-0">Issuer:</span>
        <span className="break-all flex-1">
          {authorization.subject.issuer}
        </span>
      </div>

      <div className="pl-4 flex items-baseline gap-1 min-w-0">
        <span className="text-muted-foreground shrink-0">Subject:</span>
        <span className="break-all flex-1">
          {authorization.subject.subject}
        </span>
      </div>
    </div>
  )}

  {/* Spiffe ID */}
  {authorization.spiffe && (
    <div className="min-w-0">
      <div className="mb-1 font-bold text-base">Spiffe ID</div>
      <div className="pl-4">
        <span className="break-all">{authorization.spiffe.spiffeID}</span>
      </div>
    </div>
  )}
</div>
        )}
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
