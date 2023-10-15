import { Link } from "react-router-dom"
import "../styles/styles.css"
import { useUserContext } from "../state/userContext"

export const Header = () => {
  const { user } = useUserContext()

  console.log(user)
  return (
    <header>
      <Link to="/">
        <h1>掲示板</h1>
      </Link>
      <Link to="/user">
        <p><img src={user ? "/assets/loggedIn.png" : "/assets/logout.png"} width="30px" height="auto" /></p>
      </Link>
    </header>
  )
}
