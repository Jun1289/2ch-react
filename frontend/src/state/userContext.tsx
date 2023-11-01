import axios from 'axios';
import { ReactNode, createContext, useContext, useEffect, useReducer } from 'react'
import Cookies from 'js-cookie';

type User = {
  name: string,
  hashedPassword: string,
  likes: string[],
  comments: number[],
  token: string,
  id: number
} | null

type UserState = {
  user: User,
  isLoading: boolean
}

type UserAction =
  | {
    type: "add_comment";
    newComment: number;
  }
  | {
    type: 'set_user';
    user: User | null;
  }



const userInitialState: UserState = {
  user: {
    name: "",
    hashedPassword: "",
    likes: [],
    comments: [],
    token: "",
    id: 0
  },
  isLoading: true
}


const userReducer = (userState: UserState, action: UserAction): UserState => {
  // const { threads, threadsIsLoading, error } = threadsState
  switch (action.type) {
    case 'add_comment':
      if (userState.user === null) return userState
      return {
        user: {
          ...(userState.user),
          comments: [...userState!.user!.comments, action.newComment]
        },
        isLoading: false
      }
      break;
    case 'set_user':
      return {
        user: action.user,
        isLoading: false
      }
      break;
    default:
      return userState;

  }
}

type UserContextType = {
  userState: UserState;
  // setUser: React.Dispatch<React.SetStateAction<User | null>>;
  userDispatch: React.Dispatch<UserAction>;
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
  const [userState, userDispatch] = useReducer(userReducer, userInitialState)
  const token = Cookies.get('token')

  useEffect(() => {
    const fetchedUser = async () => {
      try {
        if (!token) {
          userDispatch({ type: 'set_user', user: userInitialState.user });
          return;
        }
        const response = await axios.get(`http://localhost:8000/users?token=${token}`)
        const status = response.status
        const emptyData = !response.data.length
        console.log("user Context : ", response.data)
        if (status == 200 && !emptyData) {
          userDispatch({ type: "set_user", user: response.data[0] })
        }
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
      }
    }
    fetchedUser()
  }, [token])

  return (
    <UserContext.Provider value={{ userState, userDispatch }}>
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
