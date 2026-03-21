import getStatus from "@/models/status";

export async function GET() {
  const status = await getStatus();
  return Response.json(status);
}
