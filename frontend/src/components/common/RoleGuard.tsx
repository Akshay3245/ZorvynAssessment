import { ReactNode } from "react";
import { useAuth } from "../../hooks/useAuth";
import { Role } from "../../types";

type RoleGuardProps = {
  roles: Role[];
  children: ReactNode;
};

export const RoleGuard = ({ roles, children }: RoleGuardProps) => {
  const { user } = useAuth();

  if (!user || !roles.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
};
