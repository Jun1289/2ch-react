import axios from 'axios';
import { createContext, useContext, useEffect, useReducer } from 'react'
import Cookies from 'js-cookie';
import { UserContextType, UserProviderProps } from '../types/types';
import { userInitialState, userReducer } from '../reducers/reducers';

const UserContext = createContext<UserContextType>(null);

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
