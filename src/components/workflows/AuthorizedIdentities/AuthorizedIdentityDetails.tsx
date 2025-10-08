import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideCalendar, LucideNetwork, LucideShieldUser } from "lucide-react";
import type { AuthorizedIdentity } from "./AuthorizedIdentities.interfaces";
import {
  getFederationName,
  getFederationType,
  getSubjectFull,
  getSubjectIssuer,
} from "./AuthorizedIdentities.utils";
import { AuthorizedIdentityIssuedCredentialsTable } from "./AuthorizedIdentityIssuedCredentialsTable";

interface AuthorizedIdentityDetailsProps {
  identity: AuthorizedIdentity;
}

export function AuthorizedIdentityDetails({
  identity,
}: AuthorizedIdentityDetailsProps) {
  const federationType = getFederationType(identity);
  const federationName = getFederationName(identity);
  const subjectIssuer = getSubjectIssuer(identity);
  const subjectFull = getSubjectFull(identity);

  const createdAt = identity.createdAt
    ? new Date(identity.createdAt).toLocaleString()
    : "N/A";
  const updatedAt = identity.updatedAt
    ? new Date(identity.updatedAt).toLocaleString()
    : "N/A";

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LucideShieldUser className="h-5 w-5" />
            Authorized Identity Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LucideNetwork className="h-4 w-4" />
                Federation Reference
              </div>
              <div className="text-sm">
                <span className="font-mono">{federationType}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="font-semibold">{federationName}</span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground">
                Subject Issuer
              </div>
              <div className="text-sm font-mono break-all">{subjectIssuer}</div>
            </div>

            <div className="space-y-1 md:col-span-2">
              <div className="text-sm font-medium text-muted-foreground">
                Subject
              </div>
              <div className="text-sm font-mono break-all">{subjectFull}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LucideCalendar className="h-4 w-4" />
                Created At
              </div>
              <div className="text-sm font-mono">{createdAt}</div>
            </div>

            <div className="space-y-1">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <LucideCalendar className="h-4 w-4" />
                Updated At
              </div>
              <div className="text-sm font-mono">{updatedAt}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold tracking-tight">
          Issued Credentials
        </h2>
        <AuthorizedIdentityIssuedCredentialsTable
          credentials={identity.issuedCredentials}
        />
      </div>
    </div>
  );
}


