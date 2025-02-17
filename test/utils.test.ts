import { test , expect} from "vitest";
import { sum } from "../src/utils";

test('sum ok',()=>{
    expect(sum(3,2)).toBe(5)
})