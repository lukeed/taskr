const assert = require("assert")

describe("String", function () {
  describe("#split()", function () {
    it("should break a comma separated string into characters", function () {
      const chars = "a,b,c".split(",")
      assert.equal("a", chars[0])
      assert.equal("b", chars[1])
      assert.equal("c", chars[2])
    })
  })
})
