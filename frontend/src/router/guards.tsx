import { Navigate } from "react-router-dom";
import { useUser } from "../hooks/useUser.tsx";
import { SIGN_IN_PATH, CHAT_PATH } from "../constants/route-paths.ts";

interface RouteGuardProps {
  children: React.ReactNode;
  type: "protected" | "public";
}

export function RouteGuard({ children, type }: RouteGuardProps) {
  const { user } = useUser();

  if (type === "protected" && !user) {
    return <Navigate to={SIGN_IN_PATH} replace />;
  }

  if (type === "public" && user) {
    return <Navigate to={CHAT_PATH} replace />;
  }

  return <>{children}</>;
}
