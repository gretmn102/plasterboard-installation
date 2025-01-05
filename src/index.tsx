import React, { useState } from "react" // leave it in, otherwise it throws an error
import { createRoot } from "react-dom/client"

import "./styles.css"
import { concat } from "./utils"
import * as Model from "./model"

const initState = Model.State.create(
  { width: 800, height: 600 },
  {
    ud: Model.UD.create(200)
  },
)

function App() {
  const [model, setModel] = useState(Model.Model.start(initState))

  const content = (() => {
    switch (model.case) {
      case Model.ModelType.Start:
        return (
          <>
            <div>Start</div>
            <button onClick={() => {
              const newModel = model.fields()
              setModel(newModel)
            }}>
              Next
            </button>
          </>
        )
      case Model.ModelType.AddUDProfileToFloor: {
        const [result, next] = model.fields
        return (
          <>
            <div>{JSON.stringify(result)}</div>
            <button onClick={() => {
              setModel(next())
            }}>
              Next
            </button>
          </>
        )
      }
      case Model.ModelType.End: {
        return (
          <>
            <div>End</div>
          </>
        )
      }
    }
  })()

  return (
    <>
      <div className={concat([
        "h-screen",
        "flex",
        "justify-center",
        "items-center",
        "text-7xl",
      ])}>{content}</div>
    </>
  )
}

document.addEventListener("DOMContentLoaded", (event) => {
  const app = document.getElementById("app") as HTMLDivElement
  if (app) {
    const root = createRoot(app)
    root.render(<App />)
  }
})
