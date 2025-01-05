import React, { useState } from "react" // leave it in, otherwise it throws an error
import { createRoot } from "react-dom/client"
import { Option } from "@fering-org/functional-helper"

import "./styles.css"
import { concat } from "./utils"
import * as Model from "./model"
import { RoomSide, RoomSideName } from "./model"

const initState = Model.State.create(
  { width: 700, height: 600 },
  {
    ud: Model.UD.create(300)
  },
)


function RoomSideStep(
  props: {
    side: RoomSideName,
    result: RoomSide.AddUDProfileResult,
    next: () => Model.Model,
    setModel: (model: Model.Model) => void,
  }
) {
  const sideNoun = RoomSideName.toNoun(props.side)
  const stepDescription = (() => {
    switch (props.result.filled.case) {
      case "NotFilledYet":
        return (
          <>
            <div>Устанавливаю UD профиль на {sideNoun.accusative}.</div>
            <div>Уставлено {props.result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
          </>
        )
      case "Filled":
        return Option.reduce(
          props.result.filled.fields,
          restUd => {
            return (
              <>
                <div>Отмеряю на последнем UD профиле {restUd.installedUd.length} длину, отрезаю и устанавливаю его. Остаток UD профиля длиной в {restUd.restUd.length} отбрасываю</div>
                <div>Уставлено {props.result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
              </>
            )
          },
          () => {
            return (
              <>
                <div>Устанавливаю последний UD профиль на {sideNoun.accusative}.</div>
                <div>Уставлено {props.result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
              </>
            )
          }
        )
    }
  })()
  return (
    <>
      {stepDescription}
      <button onClick={() => {
        props.setModel(props.next())
      }}>
        Продолжить
      </button>
    </>
  )
}

function App() {
  const [model, setModel] = useState(Model.Model.start(initState))

  const content = (() => {
    switch (model.case) {
      case Model.ModelType.Start:
        return (
          <>
            <div>Начинаю укладывать на пол UD профиля.</div>
            <button onClick={() => {
              const newModel = model.fields()
              setModel(newModel)
            }}>
              Приступить
            </button>
          </>
        )
      case Model.ModelType.AddUDProfileToFloor: {
        const [result, next] = model.fields
        return <RoomSideStep
          side="floor"
          result={result}
          next={next}
          setModel={setModel}
        />
      }
      case Model.ModelType.AddUDProfileToLeftWall: {
        const [result, next] = model.fields
        return <RoomSideStep
          side="leftWall"
          result={result}
          next={next}
          setModel={setModel}
        />
      }
      case Model.ModelType.AddUDProfileToCeiling: {
        const [result, next] = model.fields
        return <RoomSideStep
          side="ceiling"
          result={result}
          next={next}
          setModel={setModel}
        />
      }
      case Model.ModelType.End: {
        const state = model.fields
        return (
          <>
            <pre>{JSON.stringify(state, undefined, 2)}</pre>
            <div>Конец</div>
          </>
        )
      }
    }
  })()

  return (
    <>
      <div className={concat([
        // "h-screen",
        // "flex",
        // "justify-center",
        // "items-center",
        // "text-7xl",
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
