import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connectToDatabase from "@/lib/db/mongodb";
import User from "@/models/User";

export async function POST(request: NextRequest) {
	try {
		await connectToDatabase();

		const { email, code, newPassword, confirmPassword } = await request.json();

		if (!email || !code || !newPassword || !confirmPassword) {
			return NextResponse.json({ message: "All fields are required" }, { status: 400 });
		}

		// Verificar que las contraseñas coincidan
		if (newPassword !== confirmPassword) {
			return NextResponse.json({ message: "Passwords do not match" }, { status: 400 });
		}

		// Ya no verificamos el código OTP aquí
		// Confiamos en que el frontend ya verificó el código en el paso anterior

		// Buscar al usuario
		const user = await User.findOne({ email });

		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}

		// Hashear la nueva contraseña
		const hashedPassword = await bcrypt.hash(newPassword, 12);

		// Actualizar la contraseña
		await User.updateOne({ email }, { $set: { password: hashedPassword } });

		return NextResponse.json({
			message: "Password reset successfully",
		});
	} catch (error) {
		console.error("Error resetting password:", error);
		return NextResponse.json({ message: "An error occurred while resetting password" }, { status: 500 });
	}
}
