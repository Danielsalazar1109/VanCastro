import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { verifyOTP } from "@/lib/utils/otpStore";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email, code } = await request.json();

		if (!email || !code) {
			return NextResponse.json({ message: "Email and code are required" }, { status: 400 });
		}

		// Verificar el código OTP
		const isValid = verifyOTP(email, code, "registration");

		if (!isValid) {
			return NextResponse.json({ message: "Invalid or expired verification code" }, { status: 400 });
		}

		// Actualizar el estado de verificación del usuario
		const updateResult = await User.updateOne({ email }, { $set: { emailVerified: true } });

		if (updateResult.modifiedCount === 0) {
			return NextResponse.json({ message: "User not found or already verified" }, { status: 400 });
		}

		return NextResponse.json({
			message: "Email verified successfully",
		});
	} catch (error) {
		console.error("Error verifying email:", error);
		return NextResponse.json({ message: "An error occurred while verifying email" }, { status: 500 });
	}
}
