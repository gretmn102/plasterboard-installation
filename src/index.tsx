import React, { useState } from "react" // leave it in, otherwise it throws an error
import { createRoot } from "react-dom/client"
import update from 'immutability-helper'

import "./styles.css"
import { concat } from "./utils"

function App() {
  return (
    <>
      <div className={concat([
        "h-screen",
        "flex",
        "justify-center",
        "items-center",
        "text-7xl",
      ])}>Hello, world!</div>
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
