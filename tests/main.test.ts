import { describe, it, expect } from "vitest"
import { Option } from "@fering-org/functional-helper"

import { CD, FrontWall, Model, RoomSide, State, stepBetweenCds, UD } from "../src/model"

describe("RoomSide", () => {
  it("add to uds", () => {
    const initRoomSide = RoomSide.create(5)
    const ud = UD.create(2)
    const floor2 = RoomSide.addUDProfile(initRoomSide, ud)
    expect(floor2)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createNotFilledYet(),
        updatedState: {
          length: 5,
          uds: [ ud ]
        }
      })
    const floor3 = RoomSide.addUDProfile(floor2.updatedState, ud)
    expect(floor3)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createNotFilledYet(),
        updatedState: {
          length: 5,
          uds: [ ud, ud ]
        }
      })
  })
  it("filled without rest", () => {
    const initRoomSide = RoomSide.create(4)
    const ud = UD.create(2)
    const result = RoomSide.addUDProfile(initRoomSide, ud)
    expect(result)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createNotFilledYet(),
        updatedState: {
          length: initRoomSide.length,
          uds: [ ud ]
        }
      })
    const result2 = RoomSide.addUDProfile(result.updatedState, ud)
    expect(result2)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createFilled(Option.mkNone()),
        updatedState: {
          length: initRoomSide.length,
          uds: [ ud, ud ]
        }
      })
  })
  it("filled with rest", () => {
    const initRoomSide = RoomSide.create(5)
    const ud = UD.create(3)
    const result = RoomSide.addUDProfile(initRoomSide, ud)
    expect(result)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createNotFilledYet(),
        updatedState: {
          length: initRoomSide.length,
          uds: [ ud ]
        }
      })
    const result2 = RoomSide.addUDProfile(result.updatedState, ud)
    const installedUd = UD.create(2)
    expect(result2)
      .toStrictEqual<RoomSide.AddUDProfileResult>({
        filled: RoomSide.Filled.createFilled(Option.mkSome({
          installedUd,
          restUd: UD.create(1),
        })),
        updatedState: {
          length: initRoomSide.length,
          uds: [ ud, installedUd ]
        }
      })
  })
})

describe("Model", () => {
  it("700x600, ud 300", () => {
    const initState = State.create(
      { width: 700, height: 600 },
      {
        ud: UD.create(300),
        cd: CD.create(0)
      },
    )
    const verticalCdsCount = initState.room.size.width / stepBetweenCds | 0
    const horizontalCdsCount = initState.room.size.height / stepBetweenCds | 0
    const initModel = Model.start(initState)
    expect(Model.simulateToEnd(initModel))
      .toStrictEqual<State>({
        room: {
          size: {
            width: 700,
            height: 600
          },
          floor: {
            length: 700,
            uds: [
              {
                length: 300
              },
              {
                length: 300
              },
              {
                length: 100
              }
            ]
          },
          ceiling: {
            length: 700,
            uds: [
              {
                length: 300
              },
              {
                length: 300
              },
              {
                length: 100
              }
            ]
          },
          leftWall: {
            length: 600,
            uds: [
              {
                length: 300
              },
              {
                length: 300
              }
            ]
          },
          rightWall: {
            length: 600,
            uds: [
              {
                length: 300
              },
              {
                length: 300
              }
            ]
          },
          frontWall: {
            size: {
              width: 700,
              height: 600
            },
            verticalCds: (() => {
              const cds = new Array<FrontWall["verticalCds"][0]>(verticalCdsCount)
              for (let index = 0; index < cds.length; index++) {
                cds[index] = {
                  pos: index * stepBetweenCds + stepBetweenCds,
                  cd: CD.create(0),
                }
              }
              return cds
            })(),
            horizontalCds: (() => {
              const cds = new Array<FrontWall["horizontalCds"][0]>(horizontalCdsCount)
              for (let index = 0; index < cds.length; index++) {
                cds[index] = {
                  pos: index * stepBetweenCds + stepBetweenCds,
                  cd: CD.create(0),
                }
              }
              return cds
            })(),
          }
        },
        constantMaterials: {
          ud: {
            length: 300
          },
          cd: CD.create(0)
        },
        usedMaterial: {
          ud: 10,
          cd: verticalCdsCount + horizontalCdsCount,
        }
      })
  })
})
