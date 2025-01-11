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

function InstallationContent({ model }: {
  model: Model.Model,
}) {
  switch (model.case) {
    case Model.ModelType.Start:
      return (
        <div>Начинаю укладывать на пол UD профиля.</div>
      )
    case Model.ModelType.AddUDProfileToFloor: {
      const [result] = model.fields
      return (
        <RoomSideStepDescription
          side="floor"
          result={result} />
      )
    }
    case Model.ModelType.AddUDProfileToLeftWall: {
      const [result] = model.fields
      return (
        <RoomSideStepDescription
          side="leftWall"
          result={result} />
      )
    }
    case Model.ModelType.AddUDProfileToCeiling: {
      const [result] = model.fields
      return (
        <RoomSideStepDescription
          side="ceiling"
          result={result} />
      )
    }
    case Model.ModelType.AddUDProfileToRightWall: {
      const [result] = model.fields
      return (
        <RoomSideStepDescription
          side="rightWall"
          result={result} />
      )
    }
    case Model.ModelType.AddVerticalCdProfile: {
      const [result] = model.fields
      return <div>Установить CD профиль вертикально на расстоянии {result.verticalCds[result.verticalCds.length - 1].pos}см от начала левой стенки.</div>
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
    case Model.ModelType.AddHorizontalCdProfile: {
      const [result] = model.fields
      const lastCdProfile = result.verticalCds[result.verticalCds.length - 1]
      return <div>Установить CD профиль горизонтально на расстоянии {lastCdProfile.pos.x}см от начала левой стенки и {lastCdProfile.pos.y}см от потолка.</div>
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
}

function InstallationAction({ model, setModel }: {
  model: Model.Model
  setModel: (updatedModel: Model.Model) => void
}) {
  switch (model.case) {
    case Model.ModelType.Start:
      return (
        <Button onClick={() => {
          const newModel = model.fields()
          setModel(newModel)
        } }>
          Приступить
        </Button>
      )
    case Model.ModelType.AddUDProfileToFloor: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.AddUDProfileToLeftWall: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.AddUDProfileToCeiling: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.AddUDProfileToRightWall: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.AddVerticalCdProfile: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.AddHorizontalCdProfile: {
      const [, next] = model.fields
      return (
        <Button onClick={() => {
          setModel(next())
        } }>
          Продолжить
        </Button>
      )
    }
    case Model.ModelType.End: {
      return null
    }
  }
}

export function Installation({ initState }: {
  initState: Model.State,
}) {
  const [model, setModel] = useState(Model.Model.start(initState))

  return (
    <Layer
      title="Установка"
      footer={
        <InstallationAction
          model={model}
          setModel={updatedModel => void setModel(updatedModel)}
        />
      }
    >
      <InstallationContent
        model={model}
      />
    </Layer>
  )
}
