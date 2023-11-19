import React from "react";
import axios from 'axios';
import Cookies from 'js-cookie';
import { createContext, useContext, useEffect, useReducer, useState } from 'react'
import { UserContextType, UserProviderProps } from '../types/types';
import { userInitialState, userReducer } from '../reducers/reducers';

const UserContext = createContext<UserContextType>(null);

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [userState, userDispatch] = useReducer(userReducer, userInitialState)
  const [token, setToken] = useState<string | undefined>(Cookies.get('token'))

  // ユーザー情報取得の処理
  useEffect(() => {
    const fetchedUser = async () => {
      try {
        if (!token) {
          userDispatch({ type: 'set_user', user: userInitialState.user });
          return;
        }
        const fetchedUsersData = await axios.get(`/api/users?token=${token}`)
        const { status, data: usersData } = fetchedUsersData
        const userData = usersData[0]
        if (status == 200) {
          userDispatch({ type: "set_user", user: userData })
        }
      } catch (error) {
        console.error("ログイン時にエラーが発生しました。", error)
      }
    }
    fetchedUser()
  }, [token])

  return (
    <UserContext.Provider value={{ userState, userDispatch, setToken }}>
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
