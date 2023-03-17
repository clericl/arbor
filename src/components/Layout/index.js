import Input from "../Input"
import Arbor from "../Arbor"
import InformationPanel from "../InformationPanel"
import Status from "../Status"

import './index.scss'

function Layout() {
  return (
    <div className="layout">
      <InformationPanel />
      <div className="workspace">
        <div className="chart-wrapper">
          <Arbor />
          <Status />
        </div>
        <Input />
      </div>
    </div>
  )
}

export default Layout
