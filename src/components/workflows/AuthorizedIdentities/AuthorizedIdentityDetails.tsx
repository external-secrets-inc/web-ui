import { DetailsCard } from "@/components/ui/DetailsCard";
import useOrgLink from "@/hooks/useOrgLink";
import { LucideCalendar, LucideNetwork, LucideShieldUser } from "lucide-react";
import { Link } from "react-router-dom";
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
  const getOrgLink = useOrgLink();
  const federationType = getFederationType(identity);
  const federationName = getFederationName(identity);
  const subjectIssuer = getSubjectIssuer(identity);
  const subjectFull = getSubjectFull(identity);

  const federationRowId = `${federationType.toLowerCase()}s/${federationName}`;

  const createdAt = identity.createdAt
    ? new Date(identity.createdAt).toLocaleString()
    : "N/A";
  const updatedAt = identity.updatedAt
    ? new Date(identity.updatedAt).toLocaleString()
    : "N/A";

  return (
    <div className="flex flex-col gap-10">
      <DetailsCard
        icon={LucideShieldUser}
        title="Authorized Identity Details"
        fields={[
          {
            icon: LucideNetwork,
            label: "Federation Reference",
            value: (
              <Link
                to={getOrgLink("/federation/identity-providers")}
                state={{ flashFederation: federationRowId }}
                className="inline-flex items-center gap-1.5 hover:underline text-link"
              >
                <span className="font-mono">{federationType}</span>
                <span className="text-muted-foreground"> / </span>
                <span className="font-semibold">{federationName}</span>
              </Link>
            ),
          },
          {
            label: "Subject Issuer",
            value: subjectIssuer,
          },
          {
            label: "Subject",
            value: subjectFull,
          },
          {
            icon: LucideCalendar,
            label: "Created At",
            value: createdAt,
          },
          {
            icon: LucideCalendar,
            label: "Updated At",
            value: updatedAt,
          },
        ]}
      />

      <div className="space-y-2">
        <h2 className="font-bold w-auto">Issued Credentials</h2>

        <AuthorizedIdentityIssuedCredentialsTable
          credentials={identity.issuedCredentials}
        />
      </div>
    </div>
  );
}
