"use client";

import { Session, User } from "lucia";
import React, { createContext, useContext } from "react";

interface sessionProviderProps {
  user: User | null;
  session: Session | null;
}
const SessionContext = createContext<sessionProviderProps>(
  {} as sessionProviderProps
);

export const SessionProvider = ({
  children,
  value,
}: {
  children: React.ReactNode;
  value: sessionProviderProps;
}) => {
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  );
};

export const useSession = () => {
  const sessionContext = useContext(SessionContext);

  if (!sessionContext) {
    throw new Error("useSession must be used within SessionProvider");
  }

  return sessionContext;
};
