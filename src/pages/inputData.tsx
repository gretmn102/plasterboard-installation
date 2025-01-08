import React, { useState } from "react" // leave it in, otherwise it throws an error

import * as Model from "../model"

export function InputData({ submit }: {
  submit?: (initState: Model.State) => void
}) {
  const [wallWidth, setWallWidth] = useState(700)
  const [wallHeight, setWallHeight] = useState(600)
  const [udLength, setUdLength] = useState(300)

  return (
    <div>
      <h1>Ввод данных</h1>
      <div>
        <h2>Стена</h2>
        <div>
          <label htmlFor="wall-width">Ширина</label>
          <div>
            <input
              id="wall-width"
              type={"number"}
              onChange={e => {
                setWallWidth(Number.parseInt(e.target.value))
              }}
              value={wallWidth}
            />
            <span>см</span>
          </div>
        </div>
        <div>
          <label htmlFor="wall-height">Высота</label>
          <div>
            <input
              id="wall-height"
              type={"number"}
              onChange={e => {
                setWallHeight(Number.parseInt(e.target.value))
              }}
              value={wallHeight}
            />
            <span>см</span>
          </div>
        </div>
      </div>
      <div>
        <h2>UD профиль</h2>
        <div>
          <label htmlFor="ud-length">Длина</label>
          <div>
            <input
              id="ud-length"
              type={"number"}
              onChange={e => {
                setUdLength(Number.parseInt(e.target.value))
              }}
              value={udLength}
            />
            <span>см</span>
          </div>
        </div>
      </div>
      <button onClick={() => {
        if (submit) {
          submit(
            Model.State.create(
              {
                width: wallWidth,
                height: wallHeight,
              },
              {
                ud: Model.UD.create(udLength)
              },
            )
          )
        }
      }
      }>
        Вычислить<br />материалы
      </button>
    </div>
  )
}
