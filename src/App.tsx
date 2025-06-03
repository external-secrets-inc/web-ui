import AxiosInterceptor from "@/components/AxiosInterceptor";
import { LayoutRoot } from "./components/layout";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import RequireActiveUser from "@/components/RequireActiveUser";
import OrgRedirector from "@/components/OrgRedirector";
import { SubscriptionProvider } from "@/context/SubscriptionContext";
import { AuditMockProvider } from "@/components/Audit/AuditMockContext";

export function App() {
  return (
    <AxiosInterceptor>
      <RequireActiveUser
        loginFallbackPath="/login"
        inactiveFallbackPath="/verify"
      >
        <OrgRedirector>
          <SubscriptionProvider>
            <FeatureFlagProvider>
              <AuditMockProvider>
                <LayoutRoot />
              </AuditMockProvider>
            </FeatureFlagProvider>
          </SubscriptionProvider>
        </OrgRedirector>
      </RequireActiveUser>
    </AxiosInterceptor>
  );
}
