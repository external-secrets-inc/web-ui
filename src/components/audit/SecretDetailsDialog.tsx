import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  LucideAlertCircle,
  LucideCheck,
  LucideClock,
  LucideRotateCcw,
  LucideShieldCheck,
  LucideSquareAsterisk,
  LucideSquareStack,
  LucideUsers
} from "lucide-react";
import { SecretDetails } from "./Audit.interfaces";

interface SecretDetailsDialogProps {
  secret: SecretDetails | null;
  onOpenChange: (open: boolean) => void;
}

export default function SecretDetailsDialog({ secret, onOpenChange }: SecretDetailsDialogProps) {
  if (!secret) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={!!secret} onOpenChange={onOpenChange}>
      <DialogContent className="w-[max(50%,640px)] max-w-[calc(100%-theme(spacing.12))] max-h-[calc(100%-theme(spacing.12))] overflow-auto grid-rows-[auto_minmax(100px,1fr)_auto] grid-cols-[minmax(100%,1fr)]">
        <DialogHeader>
          <DialogTitle className="flex items-center flex-wrap gap-2">
            <LucideSquareAsterisk className="size-6" />
            {secret.name || "Unnamed Secret"}
            <Badge variant="outline">{secret.providerName}</Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[80vh]">
          <div className="space-y-6 p-1">
            <section aria-label="Secret Metadata" className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <LucideRotateCcw className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Rotation</p>
                  <p className={cn("font-medium", !secret.lastRotation && "text-muted-foreground italic")}>
                    {secret.lastRotation ? formatDate(secret.lastRotation) : "Never rotated"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <LucideClock className="text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Last Access</p>
                  <p className={cn("font-medium", !secret.lastAccess && "text-muted-foreground italic")}>
                    {secret.lastAccess ? formatDate(secret.lastAccess) : "Never accessed"}
                  </p>
                </div>
              </div>
            </section>

            <Separator />

            <section aria-label="Policies" className="space-y-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <LucideShieldCheck />
                Policies
                <Badge variant="secondary">{secret.policies?.length || "0" }</Badge>
              </h3>
              {secret.policies?.length > 0 ? (
                <div className="space-y-2">
                  {secret.policies.map(policy => (
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

            <Separator />

            <section aria-label="Duplicates" className="space-y-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <LucideSquareStack />
                Duplicates
                <Badge variant="secondary">{secret.duplicatesAmount || "0"}</Badge>
              </h3>
              {secret.duplicates?.length > 0 ? (
                <div className="space-y-2">
                  {secret.duplicates.map(dup => (
                    <Alert variant="warning" key={dup.id} >
                      <AlertDescription className="flex items-center gap-2">
                        <LucideAlertCircle className="text-orange-500" />
                        <span className="font-medium">{dup.name || dup.id || "Unknown Duplicate"}</span>
                        <Badge variant="outline" className="ml-auto">{dup.providerName || dup.provider || "Unknown Provider"}</Badge>
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

            <Separator />

            <section aria-label="Recent Access History" className="space-y-2">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <LucideUsers />
                Recent Access History
                <Badge variant="secondary">{secret.accessorsAmount || "0"}</Badge>
              </h3>
              {secret.accessors?.length > 0 ? (
                <div className="space-y-2">
                  {secret.accessors.map(access => (
                    <Alert key={access.id}>
                      <AlertDescription className="flex items-center gap-2">
                        <Badge variant="secondary">{access.name || access.id || "Unknown Accessor"}</Badge>
                        <Badge variant="outline" className="ml-auto">
                          {formatDate(access.access_time)}
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}