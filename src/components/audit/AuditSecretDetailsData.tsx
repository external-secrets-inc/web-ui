import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LucideAlertCircle,
  LucideCheck,
  LucideClock,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSquareStack,
  LucideUsers,
  LucideSquareAsterisk,
} from "lucide-react";
import { AuditSecretData } from "./Audit.interfaces";
import { formatDate } from "@/utils/dateUtils";

interface AuditSecretDetailsDataProps {
  className?: string;
  secretData: AuditSecretData;
  setSecretId: (id: string) => void;
}

export default function AuditSecretDetailsData({ className, secretData, setSecretId }: AuditSecretDetailsDataProps) {
  return (
    <section aria-label="Details" className={cn("min-h-0 grid grid-rows-[auto_1fr] bg-background relative flex-1 border-l", className)}>
      <div className="p-6 border-b">
        <div className="flex items-center flex-wrap gap-2">
          <LucideSquareAsterisk className="size-6 text-primary" />
          {secretData.name || "Unnamed Secret"}
          <Badge variant="outline">{secretData.providerName}</Badge>
        </div>
      </div>
      <div className="space-y-6 p-6 pb-20 overflow-auto">
        <section aria-label="Secret Metadata" className="space-y-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <LucideRotateCcw className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Rotation</p>
                <p className={cn("font-medium", !secretData.lastRotation && "text-muted-foreground italic")}>
                  {secretData.lastRotation ? formatDate(secretData.lastRotation, { format: 'readableDate' }) : "Never rotated"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <LucideClock className="text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Last Access</p>
                <p className={cn("font-medium", !secretData.lastAccess && "text-muted-foreground italic")}>
                  {secretData.lastAccess ? formatDate(secretData.lastAccess, { format: 'readableDate' }) : "Never accessed"}
                </p>
              </div>
            </div>
          </div>
        </section>
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Policies" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideShieldCheck />
            Policies
            <Badge variant="secondary">{secretData.policies.length || "0"}</Badge>
          </h3>
          {secretData.policies.length > 0 ? (
            <div className="space-y-2">
              {secretData.policies.map(policy => (
                <Alert
                  key={policy.id}
                  variant={policy.status === "compliant" ? "default" : "destructive"}
                >
                  <AlertDescription className="flex items-center gap-2">
                    {policy.status === "compliant" ? (
                      <LucideCheck className="text-green-500" />
                    ) : (
                      <LucideAlertCircle className="text-destructive" />
                    )}
                    <span className="font-medium">{policy.name}</span>
                    {policy.status !== "compliant" && (
                      <Badge variant="outline" className="text-destructive border-destructive ml-auto">
                        {policy.status}
                      </Badge>
                    )}
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription className="text-muted-foreground">
                No policies associated with this secret
              </AlertDescription>
            </Alert>
          )}
        </section>
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Duplicates" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideSquareStack />
            Duplicates
            <Badge variant="secondary">{secretData.duplicates.length || "0"}</Badge>
          </h3>
          {secretData.duplicates.length > 0 ? (
            <div className="space-y-2">
              {secretData.duplicates.map(duplicate => (
                <Alert variant="warning" key={duplicate.id} onClick={() => setSecretId(duplicate.id)} className="cursor-pointer">
                  <AlertDescription className="flex items-center gap-2">
                    <LucideAlertCircle className="text-orange-500" />
                    <span className="font-medium">{duplicate.name || duplicate.id || "Unknown Duplicate"}</span>
                    <Badge variant="outline" className="ml-auto">{duplicate.providerName || duplicate.providerID || "Unknown Provider"}</Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription className="text-muted-foreground">
                No duplicates found for this secret
              </AlertDescription>
            </Alert>
          )}
        </section>
        <Separator className="-mx-6 w-[stretch]" />
        <section aria-label="Last access records" className="space-y-2">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <LucideUsers />
            Last Access Records
            <Badge variant="secondary">{secretData.accessors.length || "0"}</Badge>
          </h3>
          {secretData.accessors.length > 0 ? (
            <div className="space-y-2">
              {secretData.accessors.map(access => (
                <Alert key={access.id}>
                  <AlertDescription className="flex items-center gap-2">
                    <Badge variant="secondary">{access.name || access.id || "Unknown Accessor"}</Badge>
                    <Badge variant="outline" className="ml-auto">
                      {formatDate(access.accessTime, { format: 'readableDate' })}
                    </Badge>
                  </AlertDescription>
                </Alert>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertDescription className="text-muted-foreground">
                No recent access history available
              </AlertDescription>
            </Alert>
          )}
        </section>
      </div>
    </section>
  );
}