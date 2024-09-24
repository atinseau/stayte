import { Link } from "react-router-dom"

function Welcome() {
  return (<div>
    <p>Welcome</p>
    <Link to={{ pathname: "/", search: window.location.search }}>Go to index</Link>
  </div>)
}

export default Welcome
