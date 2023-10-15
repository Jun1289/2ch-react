import { ReactNode, createContext, useContext, useState } from 'react'
type UserContextType = {
  user: object | null;
  setUser: React.Dispatch<React.SetStateAction<object | null>>;
};

const UserContext = createContext<UserContextType | null>(null);

interface UserProviderProps {
  children: ReactNode;
}
// export const userContext = () => {
//   const Context = useContext(UserContext);
//   if (onboardingContext === undefined) {
//     throw new Error('useOnboardingContext must be inside a 
//     OnboardingProvider');
//   }
//   return onboardingContext;
// };

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<object | null>(null);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (context === null) {
    throw new Error('useUserContext must be used within a UserProvider');
  }
  return context;
};
