import React, { useState } from "react" // leave it in, otherwise it throws an error

import * as Model from "../model"
import { Button } from "../components/button"
import { Input } from "../components/input"
import { Layer } from "../components/layer"

function Section({ title, children }: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h2>{title}</h2>
      {children}
    </section>
  )
}

export function InputData({ submit }: {
  submit?: (initState: Model.State) => void
}) {
  const [wallWidth, setWallWidth] = useState(700)
  const [wallHeight, setWallHeight] = useState(600)
  const [udLength, setUdLength] = useState(300)

  return (
    <Layer
      title="Ввод данных"
      footer={
        <Button
          onClick={() => {
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
        </Button>
      }
    >
      <Section
        title="Стена"
      >
        <Input
          id="wall-width"
          label="Ширина"
          initValue={wallWidth}
          onChange={value => {
            setWallWidth(value)
          }}
        />
        <Input
          id="wall-height"
          label="Высота"
          onChange={value => {
            setWallHeight(value)
          }}
          initValue={wallHeight}
        />
      </Section>
      <Section
        title="UD профиль"
      >
        <Input
          id="ud-length"
          label="Длина"
          initValue={udLength}
          onChange={value => {
            setUdLength(value)
          }}
        />
      </Section>
    </Layer>
  )
}
