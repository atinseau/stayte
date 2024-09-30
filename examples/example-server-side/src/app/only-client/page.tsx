import dynamic from "next/dynamic"

const Count = dynamic(() => import("@/examples/Count"), { ssr: false })

export default function Page() {

  return <div>
    <Count />
  </div>
}