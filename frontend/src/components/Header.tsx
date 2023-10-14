import { Link } from "react-router-dom"
import "../styles/styles.css"

export const Header = () => {
  return (
    <header>
      <Link to="/">
        <h1>掲示板</h1>
      </Link>
      <Link to="/user/1">
        <p><img src="/assets/noAvatar.png" width="30px" height="auto" /></p>
      </Link>
    </header>
  )
}
