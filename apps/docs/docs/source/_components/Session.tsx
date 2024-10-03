import NoSsr from "@site/src/components/NoSsr";
import { lazy } from "react";

const Session = lazy(() => import("./examples/SessionExample"));

export default function SessionExample() {
  return <NoSsr>
    <Session />
  </NoSsr>
}