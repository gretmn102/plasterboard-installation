import { describe, it, expect } from "vitest"
import { Option } from "@fering-org/functional-helper"

import { RoomSide, UD } from "../src/model"

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
