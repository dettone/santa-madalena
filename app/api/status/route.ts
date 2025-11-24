import getStatus from "../../../models/status";

export async function GET() {
  const status = await getStatus();
  console.log(status);
  return Response.json({
    status: "ok",
  });
}
