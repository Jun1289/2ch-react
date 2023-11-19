import React from "react";
import { Link } from "react-router-dom"
import "../styles/styles.css"
import { useUserContext } from "../context/userContext"

export const Header = () => {
  const { userState } = useUserContext()
  const { user, isLoading } = userState

  return (
    <header>
      <Link to="/">
        <h1>掲示板</h1>
      </Link>
      {isLoading ?
        (
          null
        ) :
        (
          <Link to="/user">
            <p><img src=
              {
                user ?
                  "/assets/loggedIn.png" :
                  "/assets/logout.png"
              }
              width="30px"
              height="auto" /></p>
          </Link>
        )
      }
    </header>
  )
}
