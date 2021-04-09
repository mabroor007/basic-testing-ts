import { returnsOk } from "./app";

describe("App Runs", () => {
  it("Loggs ok", () => {
    expect(returnsOk()).toBe("Ok");
  });
});
