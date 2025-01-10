import React, { useState } from "react" // leave it in, otherwise it throws an error
import { Option } from "@fering-org/functional-helper"

import * as Model from "../model"
import { Button } from "../components/button"
import { RoomSide, RoomSideName } from "../model"
import { Layer } from "../components/layer"

function RoomSideStepDescription({ side, result }: {
  side: RoomSideName,
  result: RoomSide.AddUDProfileResult,
}) {
  const sideNoun = RoomSideName.toNoun(side)

  switch (result.filled.case) {
    case "NotFilledYet":
      return (
        <>
          <div>Устанавливаю UD профиль на {sideNoun.accusative}.</div>
          <div>Уставлено {result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
        </>
      )
    case "Filled":
      return Option.reduce(
        result.filled.fields,
        restUd => {
          return (
            <>
              <div>Отмеряю на последнем UD профиле {restUd.installedUd.length} длину, отрезаю и устанавливаю его. Остаток UD профиля длиной в {restUd.restUd.length} отбрасываю</div>
              <div>Уставлено {result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
            </>
          )
        },
        () => {
          return (
            <>
              <div>Устанавливаю последний UD профиль на {sideNoun.accusative}.</div>
              <div>Уставлено {result.updatedState.uds.length} UD профилей на {sideNoun.adpositional}.</div>
            </>
          )
        }
      )
  }
}

export function Installation({ initState }: {
  initState: Model.State,
}) {
  const [model, setModel] = useState(Model.Model.start(initState))

  const result = (() => {
    switch (model.case) {
      case Model.ModelType.Start:
        return {
          content: (
            <div>Начинаю укладывать на пол UD профиля.</div>
          ),
          footer: (
            <Button onClick={() => {
              const newModel = model.fields()
              setModel(newModel)
            }}>
              Приступить
            </Button>
          ),
        }
      case Model.ModelType.AddUDProfileToFloor: {
        const [result, next] = model.fields
        return {
          content: (
            <RoomSideStepDescription
              side="floor"
              result={result}
            />
          ),
          footer: (
            <Button onClick={() => {
              setModel(next())
            }}>
              Продолжить
            </Button>
          ),
        }
      }
      case Model.ModelType.AddUDProfileToLeftWall: {
        const [result, next] = model.fields
        return {
          content: (
            <RoomSideStepDescription
              side="leftWall"
              result={result}
            />
          ),
          footer: (
            <Button onClick={() => {
              setModel(next())
            }}>
              Продолжить
            </Button>
          ),
        }
      }
      case Model.ModelType.AddUDProfileToCeiling: {
        const [result, next] = model.fields
        return {
          content: (
            <RoomSideStepDescription
              side="ceiling"
              result={result}
            />
          ),
          footer: (
            <Button onClick={() => {
              setModel(next())
            }}>
              Продолжить
            </Button>
          ),
        }
      }
      case Model.ModelType.AddUDProfileToRightWall: {
        const [result, next] = model.fields
        return {
          content: (
            <RoomSideStepDescription
              side="rightWall"
              result={result}
            />
          ),
          footer: (
            <Button onClick={() => {
              setModel(next())
            }}>
              Продолжить
            </Button>
          ),
        }
      }
      case Model.ModelType.End: {
        const state = model.fields
        return {
          content: (
            <>
              <pre>{JSON.stringify(state, undefined, 2)}</pre>
              <div>Конец</div>
            </>
          )
        }
      }
    }
  })()

  return (
    <Layer
      title="Установка"
      footer={result.footer}
    >
      {result.content}
    </Layer>
  )
}
