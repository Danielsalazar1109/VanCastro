import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(req: NextRequest, { params }: { params: { filename: string } }) {
	try {
		const filename = params.filename;

		// Validate filename to prevent directory traversal attacks
		if (filename.includes("..") || !filename.endsWith(".pdf")) {
			return NextResponse.json({ error: "Invalid filename" }, { status: 400 });
		}

		// Get the file path
		const filePath = path.join(process.cwd(), "public", "contracts", filename);

		try {
			// Check if file exists
			await fs.access(filePath);
		} catch (error) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		// Read the file
		const fileBuffer = await fs.readFile(filePath);

		// Return the file with appropriate headers
		return new NextResponse(fileBuffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": `inline; filename="${filename}"`,
			},
		});
	} catch (error) {
		console.error("Error serving contract file:", error);
		return NextResponse.json({ error: "Failed to serve file" }, { status: 500 });
	}
}
