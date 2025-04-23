import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { checkOTP } from "@/lib/utils/otpStore";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email, code } = await request.json();

		if (!email || !code) {
			return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
		}

		// Verificar si el usuario existe
		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Verificar el código OTP sin eliminarlo
		const isValid = checkOTP(email, code, "password-reset");

		if (!isValid) {
			return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 });
		}

		return NextResponse.json({
			message: "Code verified successfully",
			verified: true,
		});
	} catch (error) {
		console.error("Error verifying reset code:", error);
		return NextResponse.json({ message: "An error occurred while verifying code" }, { status: 500 });
	}
}
