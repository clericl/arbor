import Input from "../Input"
import Arbor from "../Arbor"
import InformationPanel from "../InformationPanel"
import Loading from "../Loading"

import './index.scss'

function Layout() {
  return (
    <div className="layout">
      <InformationPanel />
      <div className="workspace">
        <div className="chart-wrapper">
          <Arbor />
          <Loading />
        </div>
        <Input />
      </div>
    </div>
  )
}

export default Layout
