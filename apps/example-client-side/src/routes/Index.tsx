import { Link } from "react-router-dom"
import { useGluon } from "stayte"
import { countGluon, doubleGluon, floatGluon, isOnlineGluon } from "../gluon"

function CountButton() {
  const count = useGluon(countGluon)

  return (<div>
    <button onClick={() => count.value = 0}>reset</button>
    <button onClick={() => count.value--}>decrementer</button>
    <button onClick={() => count.value++}>incrementer</button>
    <p>Count : {count.value}</p>
  </div>)
}

function OnlineButton() {

  const isOnline = useGluon(isOnlineGluon)

  return (
    <div>
      <button onClick={() => isOnline.value = !isOnline.value}>toggle {isOnline.value ? 'offline' : 'online'}</button>
      {isOnline.value && <p>You are online</p>}
      {!isOnline.value && <p>You are offline</p>}
    </div>
  )
}

function FloatInput() {

  const float = useGluon(floatGluon)

  return (
    <div>
      <input type="number" step={0.1} value={float.value} onChange={(e) => float.value = parseFloat(e.target.value)} />
      <p>Float : {float.value}</p>
    </div>
  )
}

function DoubleButton() {
  const double = useGluon(doubleGluon)
  return (
    <p>Double : {double.value}</p>
  )
}

function Index() {


  return (<div>
    <p>Index</p>
    <CountButton />
    <OnlineButton />
    <FloatInput />
    <DoubleButton />

    <Link to={{ pathname: "/welcome", search: window.location.search }}>Go to welcome</Link>
  </div>)
}

export default Index
