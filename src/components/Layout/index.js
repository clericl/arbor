import Input from "../Input"
import Arbor from "../Arbor"
import InformationPanel from "../InformationPanel"

import './index.scss'
import Title from "../Title"

function Layout() {
  return (
    <div className="layout">
      <Arbor />
      <div className="top">
        <div className="left">
          <Title />
          <InformationPanel />
        </div>
      </div>
      <div className="bottom">
        <Input />
      </div>
    </div>
  )
}

export default Layout
