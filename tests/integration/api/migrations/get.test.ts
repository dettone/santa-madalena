describe("GET /api/migrations", () => {
  it("should return a list of migrations", async () => {
    const response = await fetch("/api/migrations");
    expect(response.status).toBe(200);
    expect(response.body).toBeInstanceOf(Array);
  });
});
