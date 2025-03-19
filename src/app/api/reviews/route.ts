export async function GET() {
    const API_KEY = process.env.NEXT_PUBLIC_SHAPO_API_KEY;
    console.log("API_KEY:", API_KEY);
    
    try {
        const response = await fetch("https://api.shapo.io/testimonials?size=10", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${API_KEY}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            const errorDetails = await response.text();
            console.error("Response error:", errorDetails);
            throw new Error("Error fetching reviews");
        }
        
        const contentType = response.headers.get("Content-Type");
        if (contentType && contentType.includes("application/json")) {
            const data = await response.json();
            return Response.json(data, { status: 200 });
        } else {
            const errorDetails = await response.text();
            console.error("Error: Expected JSON, but received", contentType);
            console.error("Response body:", errorDetails);
            throw new Error("Error: Response is not JSON");
        }
    } catch (error: any) {
        console.error("Caught error:", error.message);
        console.error("Stack trace:", error.stack);
        return Response.json({ message: "Error fetching reviews", error: error.message }, { status: 500 });
    }
 }