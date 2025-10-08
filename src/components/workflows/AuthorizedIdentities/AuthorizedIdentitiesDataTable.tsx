import { DataTable, useData } from "@/components/ui/DataProvider";
import useOrgLink from "@/hooks/useOrgLink";
import { useNavigate } from "react-router-dom";
import type { AuthorizedIdentity } from "./AuthorizedIdentities.interfaces";

export function AuthorizedIdentitiesDataTable() {
  const navigate = useNavigate();
  const getOrgLink = useOrgLink();
  useData<AuthorizedIdentity>();

  return (
    <DataTable
      onRowClick={(row) => {
        const identity = row as AuthorizedIdentity;
        navigate(
          getOrgLink(`/federation/authorized-identities/${identity.name}`)
        );
      }}
    />
  );
}
