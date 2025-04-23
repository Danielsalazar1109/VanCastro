import { NextRequest, NextResponse } from "next/server";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";
import { generateOTP } from "@/lib/utils/otpStore";
import { sendEmail } from "@/lib/utils/emailService";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email } = await request.json();

		if (!email) {
			return NextResponse.json({ message: "Email is required" }, { status: 400 });
		}

		// Verificar si el usuario existe
		const user = await User.findOne({ email });

		if (!user) {
			// No revelar si el usuario existe o no por seguridad
			return NextResponse.json(
				{ message: "If the email exists, a verification code has been sent" },
				{ status: 200 }
			);
		}

		// Generar código OTP
		const code = generateOTP(email, "registration");

		// Enviar email con el código
		await sendEmail(email, "otpVerification", {
			userName: user.firstName,
			code,
			purpose: "registration",
		});

		return NextResponse.json({
			message: "Verification code sent successfully",
		});
	} catch (error) {
		console.error("Error requesting verification:", error);
		return NextResponse.json({ message: "An error occurred while sending verification code" }, { status: 500 });
	}
}
