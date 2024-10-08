import Count from "@/examples/Count";
import MemoryGluon from "@/examples/MemoryGluon";
import User from "@/examples/User";

export default function Page() {
  return (<div style={{ flexDirection: 'column', gap: 30, display: 'flex' }}>
    <MemoryGluon />
    <Count />
    <User />
  </div>)
}