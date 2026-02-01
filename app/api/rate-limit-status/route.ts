import { NextResponse } from "next/server";
import {
	checkCooldown,
	getClientIP,
	getGlobalRateLimitStatus,
} from "@/lib/rateLimit";

export async function GET(request: Request) {
	try {
		const ip = getClientIP(request.headers);
		const globalStatus = getGlobalRateLimitStatus();
		const cooldown = checkCooldown(ip);

		return NextResponse.json(
			{
				remaining: globalStatus.remaining,
				total: globalStatus.total,
				resetTime: new Date(globalStatus.resetTime).toISOString(),
				onCooldown: !cooldown.allowed,
				cooldownRemainingMs: cooldown.remainingMs || 0,
			},
			{
				headers: {
					"X-RateLimit-Remaining": String(globalStatus.remaining),
					"X-RateLimit-Limit": String(globalStatus.total),
					"X-RateLimit-Reset": String(globalStatus.resetTime),
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
