import { IUserData } from "@/types";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useIsAuthenticated from "react-auth-kit/hooks/useIsAuthenticated";
import { Navigate } from "react-router-dom";


interface RequireActiveUserProps {
    children: JSX.Element;
    loginFallbackPath: string;
    inactiveFallbackPath: string
}

function RequireActiveUser({
    children,
    loginFallbackPath,
    inactiveFallbackPath,
} : RequireActiveUserProps) {
    const isAuthenticated = useIsAuthenticated()
    const user = useAuthUser<IUserData>();

    if (!isAuthenticated) return <Navigate to={loginFallbackPath} replace={true} />;

    if (!user) return <Navigate to={loginFallbackPath} replace={true} />
    if (!user.isActive) return <Navigate to={inactiveFallbackPath} replace={true} />

    return (
        <>  
        {children}
        </>
    )
}

export default RequireActiveUser