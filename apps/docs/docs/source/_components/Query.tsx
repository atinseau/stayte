import NoSsr from "@site/src/components/NoSsr";
import { lazy } from "react";

const Query = lazy(() => import("./examples/QueryExample"));

export default function QueryExample() {
  return <NoSsr>
    <Query />
  </NoSsr>
}