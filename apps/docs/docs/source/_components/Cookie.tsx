import NoSsr from "@site/src/components/NoSsr";
import { lazy } from "react";

const Cookie = lazy(() => import("./examples/CookieExample"));

export default function CookieExample() {
  return <NoSsr>
    <Cookie />
  </NoSsr>
}