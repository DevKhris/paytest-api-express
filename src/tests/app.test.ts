import request from "supertest"
import app from "../index"

describe("Health Check", () => {
    it("should pass basic test", () => {
        expect(1 + 1).toBe(2)
    })
})
