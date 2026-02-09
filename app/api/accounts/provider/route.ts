import Account from "@/database/account.model";
import dbConnect from "@/lib/mongoose";
import {NextResponse} from "next/server";

export async function POST(request: Request) {
  try {
    const { providerAccountId } = await request.json();

    await dbConnect();

    const account = await Account.findOne({ providerAccountId });
    if (!account) {
      return NextResponse.json({ success: false, message: "Account not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: account }, { status: 200 });
  } catch (error) {
    console.error("Error in accounts/provider:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}