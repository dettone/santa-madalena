describe("GET /api/status", () => {
  it("should return status ok", async () => {
    const response = await fetch("http://localhost:3000/api/status");
    const responseBody = await response.json();
    expect(response.status).toBe(200);
    expect(responseBody).toEqual({ status: "ok" });
  });
});
