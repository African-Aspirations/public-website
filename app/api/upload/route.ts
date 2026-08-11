import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth-session";

const MAX_FILE_SIZE_BYTES = 4 * 1024 * 1024; // 4MB

export const POST = async (req: Request) => {
  const { response: unauthorized } = await requireSession();
  if (unauthorized) return unauthorized;

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return new NextResponse("No file was uploaded", { status: 400 });
  }

  if (!file.type.startsWith("image/")) {
    return new NextResponse("Only image files are allowed", { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return new NextResponse("Image must be smaller than 4MB", {
      status: 400,
    });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = buffer.toString("base64");
  const url = `data:${file.type};base64,${base64}`;

  return NextResponse.json({ url }, { status: 200 });
};
