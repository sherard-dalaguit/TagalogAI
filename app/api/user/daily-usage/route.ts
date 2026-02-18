import {auth} from "@/auth";
import {NextResponse} from "next/server";
import {getDailyUsage} from "@/lib/server/usage";

export async function GET(): Promise<NextResponse> {
  const session = await auth();
  const user = session?.user;

  if (!user?.id) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  const usage = await getDailyUsage(user.id);

  return NextResponse.json({ 
    success: true, 
    data: usage
  });
}
