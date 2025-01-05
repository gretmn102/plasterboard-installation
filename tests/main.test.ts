import { describe, it, expect } from "vitest"
import { Choice, Option } from "@fering-org/functional-helper"
import update from "immutability-helper"

import { Floor, UD } from "../src/model"

describe("Floor", () => {
  it("add to uds", () => {
    const initFloor = Floor.create(5)
    const ud = UD.create(2)
    const floor2 = Floor.addUDProfile(initFloor, ud)
    expect(floor2)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createNotFilledYet(),
        updatedState: {
          length: 5,
          uds: [ ud ]
        }
      })
    const floor3 = Floor.addUDProfile(floor2.updatedState, ud)
    expect(floor3)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createNotFilledYet(),
        updatedState: {
          length: 5,
          uds: [ ud, ud ]
        }
      })
  })
  it("filled without rest", () => {
    const initFloor = Floor.create(4)
    const ud = UD.create(2)
    const result = Floor.addUDProfile(initFloor, ud)
    expect(result)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createNotFilledYet(),
        updatedState: {
          length: initFloor.length,
          uds: [ ud ]
        }
      })
    const result2 = Floor.addUDProfile(result.updatedState, ud)
    expect(result2)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createFilled(Option.mkNone()),
        updatedState: {
          length: initFloor.length,
          uds: [ ud, ud ]
        }
      })
  })
  it("filled with rest", () => {
    const initFloor = Floor.create(3)
    const ud = UD.create(2)
    const result = Floor.addUDProfile(initFloor, ud)
    expect(result)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createNotFilledYet(),
        updatedState: {
          length: initFloor.length,
          uds: [ ud ]
        }
      })
    const result2 = Floor.addUDProfile(result.updatedState, ud)
    expect(result2)
      .toStrictEqual<Floor.AddUDProfileResult>({
        filled: Floor.Filled.createFilled(Option.mkSome(
          UD.create(1)
        )),
        updatedState: {
          length: initFloor.length,
          uds: [ ud, UD.create(1) ]
        }
      })
  })
})
