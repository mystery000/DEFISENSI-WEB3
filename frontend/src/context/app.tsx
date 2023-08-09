import { ReactNode, createContext, useContext } from "react";
import useLocalStorage from "../lib/hooks/useLocalStroage";

export type User = {
  address: string;
};

const initialState: { user: User; setUser: (user: User) => void } = {
  user: { address: "" },
  setUser: () => {},
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error(`useAppContext must be used within a AppContextProvider`);
  }
  return context;
};

export const AppContext = createContext(initialState);
AppContext.displayName = "AppContext";

const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useLocalStorage<User>("user", { address: "" });

  return (
    <AppContext.Provider value={{ user, setUser }}>
      {children}
    </AppContext.Provider>
  );
};

export const ManagedAppContext = ({ children }: { children: ReactNode }) => {
  return <AppContextProvider>{children}</AppContextProvider>;
};
