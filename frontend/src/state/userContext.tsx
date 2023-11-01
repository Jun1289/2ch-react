import axios from 'axios';
import { ReactNode, createContext, useContext, useEffect, useState } from 'react'
import Cookies from 'js-cookie';

type User = {
  name: string,
  hashedPassword: string,
  likes: string[],
  comments: string[],
  token: string,
  id: number
}

type UserContextType = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  loading: boolean
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const token = Cookies.get('token')

  useEffect(() => {
    const fetchedUser = async () => {
      try {
        if (!token) {
          setLoading(false)
          return
        }
        const response = await axios.get(`http://localhost:8000/users?token=${token}`)
        const status = response.status
        const emptyData = !response.data.length
        console.log("user Context : ", response.data)
        if (status == 200 && !emptyData) {
          setUser(response.data[0])
          setLoading(false)
        } else {
          setLoading(false)
        }
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
        setLoading(false)
      }
    }
    fetchedUser()
  }, [token])

  return (
    <UserContext.Provider value={{ user, setUser, loading }}>
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
