import { Badge } from "@/components/ui/badge";
import useGetAuthorizedIdentities from "@/services/authorizedidentities/queries/useGetAuthorizedIdentities";
import { useMemo } from "react";

export function AuthorizedIdentitiesCountBadge() {
  const { data: identitiesData } = useGetAuthorizedIdentities();

  const count = useMemo(() => {
    if (!identitiesData) return 0;
    return identitiesData.length;
  }, [identitiesData]);

  if (count === 0) return null;

  return (
    <Badge variant="secondary" className="ml-auto">
      {count}
    </Badge>
  );
}


