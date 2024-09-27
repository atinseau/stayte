import Count from "@/examples/Count";
import User from "@/examples/User";

export default function Page() {
  return (<div style={{ flexDirection: 'column', gap: 30, display: 'flex' }}>
    <Count />
    <User />
  </div>)
}