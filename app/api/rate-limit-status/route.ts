import { NextResponse } from "next/server";
import { getAIRateLimitStatus, getClientIP } from "@/lib/rateLimit";

export async function GET(request: Request) {
	try {
		const ip = getClientIP(request.headers);
		const status = getAIRateLimitStatus(ip);

		return NextResponse.json(
			{
				remaining: status.remaining,
				total: status.total,
				resetTime: new Date(status.resetTime).toISOString(),
			},
			{
				headers: {
					"X-RateLimit-Remaining": String(status.remaining),
					"X-RateLimit-Limit": String(status.total),
					"X-RateLimit-Reset": String(status.resetTime),
				},
			},
		);
	} catch (error) {
		console.error("Rate limit status error:", error);
		return NextResponse.json(
			{ error: "Failed to get rate limit status" },
			{ status: 500 },
		);
	}
}
