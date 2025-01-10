import React, { useState } from "react" // leave it in, otherwise it throws an error
import { createRoot } from "react-dom/client"

import "./styles.css"
import { concat } from "./utils"
import * as Model from "./model"
import { Home } from "./pages/home"
import { InputData } from "./pages/inputData"
import { RequiredMaterials } from "./pages/requiredMaterials"
import { Installation } from "./pages/installation"
import { Navbar } from "./components/navbar"

enum Page {
  "home",
  "inputData",
  "requiredMaterials",
  "installation",
}

function App(): React.ReactElement {
  const [state, setState] = useState<Model.State | undefined>(undefined)
  const [model, setModel] = useState<Model.Model | undefined>(undefined)
  const [page, setPage] = useState(Page.home)

  const currentPage = (() => {
    switch (page) {
      case Page.home:
        return (
          <Home onStart={() => void setPage(Page.inputData) } />
        )
      case Page.inputData:
        return (
          <InputData submit={initState => {
            setState(initState)
            setModel(Model.Model.start(initState))
            setPage(Page.requiredMaterials)
          }} />
        )
      case Page.requiredMaterials:
        if (!model) { return <div>Error</div>}
        const endState = Model.Model.simulateToEnd(model)
        return (
          <RequiredMaterials
            requiredMaterials={endState.usedMaterial}
            onStartInstallation={() => void setPage(Page.installation)}
          />
        )
      case Page.installation:
        if (!state) { return <div>Error</div>}
        return (
          <Installation initState={state} />
        )
    }
  })()

  return (
    <div className={concat([
      "flex",
      "justify-center",
    ])}>
      <div className={concat([
        "w-full",
        "max-w-[480px]",
        "h-screen",
        "flex",
        "flex-col",
      ])}>
        <Navbar />
        {currentPage}
      </div>
    </div>
  )
}

document.addEventListener("DOMContentLoaded", (event) => {
  const app = document.getElementById("app") as HTMLDivElement
  if (app) {
    const root = createRoot(app)
    root.render(<App />)
  }
})
