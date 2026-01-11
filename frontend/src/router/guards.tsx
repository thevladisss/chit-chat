import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { AUTH_PATH, CHAT_PATH } from "../constants/route-paths.ts";
import { selectUser } from "../stores/chat/selectors.ts";

interface RouteGuardProps {
  children: React.ReactNode;
  type: "protected" | "public";
}

export function RouteGuard({ children, type }: RouteGuardProps) {
  const user = useSelector(selectUser);

  if (type === "protected" && !user) {
    return <Navigate to={AUTH_PATH} replace />;
  }

  if (type === "public" && user) {
    return <Navigate to={CHAT_PATH} replace />;
  }

  return <>{children}</>;
}
