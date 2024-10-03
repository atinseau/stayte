import NoSsr from "@site/src/components/NoSsr";
import { lazy } from "react";

const Local = lazy(() => import("./examples/LocalExample"));

export default function LocalExample() {
  return <NoSsr>
    <Local />
  </NoSsr>
}