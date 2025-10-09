import { LayoutPage } from "@/components/layout";
import { useSetBreadcrumb } from "@/components/layout/BreadcrumbsContext";
import { Loader } from "@/components/ui/Loader";
import { AuthorizedIdentityDetails } from "@/components/workflows/AuthorizedIdentities";
import { getCredentialsCount } from "@/components/workflows/AuthorizedIdentities/AuthorizedIdentities.utils";
import useGetAuthorizedIdentity from "@/services/authorizedidentities/queries/useGetAuthorizedIdentity";
import { handleDefaultApiHttpError } from "@/services/servicesHelpers";
import type { ApiHttpError } from "@/types";
import { AxiosError } from "axios";
import { LucideIdCard } from "lucide-react";
import { useLocation, useParams } from "react-router-dom";

export function PageAuthorizedIdentityDetails() {
  const { identityName = "" } = useParams<{
    identityName: string;
  }>();
  const location = useLocation();

  const {
    data: identity,
    isLoading,
    isError,
    error,
  } = useGetAuthorizedIdentity(identityName);

  const breadcrumbLabel = identity?.name;
  useSetBreadcrumb(location.pathname, breadcrumbLabel);

  if (isError) {
    if (error instanceof AxiosError) {
      handleDefaultApiHttpError(
        error as AxiosError<ApiHttpError>,
        "Error fetching authorized identity details"
      );
    }
  }

  const title = identityName ? (
    <span className="flex items-center gap-2 flex-wrap">
      <LucideIdCard className="size-6 text-muted-foreground" />
      <span>{identityName}</span>
    </span>
  ) : (
    <span className="flex items-center gap-2">
      <LucideIdCard className="size-6 text-muted-foreground" /> Authorized
      Identity
    </span>
  );

  const credentialsCount = identity ? getCredentialsCount(identity) : 0;

  const description = identity ? (
    <>
      An authorized identity with{" "}
      <span className="font-bold text-foreground">{credentialsCount}</span>{" "}
      <span className="font-bold">
        {credentialsCount === 1 ? "credential" : "credentials"}
      </span>{" "}
      issued. Review the identity details and all credentials that have been
      generated or retrieved.
    </>
  ) : null;

  return (
    <LayoutPage title={title} description={description}>
      {isLoading ? (
        <div className="flex justify-center items-center h-48">
          <Loader size="lg" />
        </div>
      ) : isError ? (
        <div>Error loading authorized identity details.</div>
      ) : !identity ? (
        <div>Authorized identity not found.</div>
      ) : (
        <AuthorizedIdentityDetails identity={identity} />
      )}
    </LayoutPage>
  );
}

