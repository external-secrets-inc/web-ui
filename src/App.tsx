import AxiosInterceptor from "@/components/AxiosInterceptor";
import { LayoutRoot } from "./components/layout";
import { FeatureFlagProvider } from "@/context/FeatureFlagContext";
import RequireActiveUser from "@/components/RequireActiveUser";
import OrgRedirector from "@/components/OrgRedirector";
import { SubscriptionProvider } from "@/context/SubscriptionContext";

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
              <LayoutRoot />
            </FeatureFlagProvider>
          </SubscriptionProvider>
        </OrgRedirector>
      </RequireActiveUser>
    </AxiosInterceptor>
  );
}
