import { lazy } from "react"
import NoSsr from "./NoSsr"

const LazyCounter = lazy(() => import("./Counter"))

const ClientCounter = () => {

  return <NoSsr>
    <LazyCounter />
  </NoSsr>

}

export default ClientCounter 