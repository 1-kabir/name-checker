import fs from "node:fs";
import path from "node:path";

interface RateLimitData {
	global: { count: number; resetDate: string };
	cooldowns: Record<string, { until: number }>;
}

const RATE_LIMIT_FILE = path.join(process.cwd(), "data", "ai-rate-limits.json");
const MAX_GLOBAL_REQUESTS_PER_DAY = 50;
const COOLDOWN_DURATION_MS = 60 * 1000; // 1 minute cooldown

// Ensure data directory exists
function ensureDataDir() {
	const dataDir = path.dirname(RATE_LIMIT_FILE);
	if (!fs.existsSync(dataDir)) {
		fs.mkdirSync(dataDir, { recursive: true });
	}
}

// Load rate limit data from file
function loadRateLimitData(): RateLimitData {
	ensureDataDir();
	try {
		if (fs.existsSync(RATE_LIMIT_FILE)) {
			const data = fs.readFileSync(RATE_LIMIT_FILE, "utf-8");
			return JSON.parse(data);
		}
	} catch (error) {
		console.error("Error loading rate limit data:", error);
	}
	return {
		global: { count: 0, resetDate: getTodayDate() },
		cooldowns: {},
	};
}

// Save rate limit data to file
function saveRateLimitData(data: RateLimitData) {
	ensureDataDir();
	try {
		fs.writeFileSync(RATE_LIMIT_FILE, JSON.stringify(data, null, 2));
	} catch (error) {
		console.error("Error saving rate limit data:", error);
	}
}

// Get today's date as string (YYYY-MM-DD)
function getTodayDate(): string {
	return new Date().toISOString().split("T")[0];
}

// Get end of day timestamp
function getEndOfDay(): number {
	const tomorrow = new Date();
	tomorrow.setDate(tomorrow.getDate() + 1);
	tomorrow.setHours(0, 0, 0, 0);
	return tomorrow.getTime();
}

// Extract IP from headers
export function getClientIP(headers: Headers): string {
	const forwarded = headers.get("x-forwarded-for");
	const realIp = headers.get("x-real-ip");

	if (forwarded) {
		return forwarded.split(",")[0].trim();
	}

	if (realIp) {
		return realIp.trim();
	}

	return "unknown";
}

// Check cooldown for an IP
export function checkCooldown(ip: string): {
	allowed: boolean;
	remainingMs?: number;
} {
	const data = loadRateLimitData();
	const now = Date.now();

	const cooldownRecord = data.cooldowns[ip];
	if (cooldownRecord && cooldownRecord.until > now) {
		return {
			allowed: false,
			remainingMs: cooldownRecord.until - now,
		};
	}

	// Clear expired cooldowns periodically
	if (Object.keys(data.cooldowns).length > 50) {
		for (const [key, record] of Object.entries(data.cooldowns)) {
			if (record.until < now) {
				delete data.cooldowns[key];
			}
		}
		saveRateLimitData(data);
	}

	return { allowed: true };
}

// Set cooldown for an IP
function setCooldown(ip: string) {
	const data = loadRateLimitData();
	data.cooldowns[ip] = {
		until: Date.now() + COOLDOWN_DURATION_MS,
	};
	saveRateLimitData(data);
}

// Check and update global rate limits
export function checkAIRateLimit(): {
	allowed: boolean;
	reason?: string;
	remaining?: number;
	resetTime?: number;
} {
	const data = loadRateLimitData();
	const today = getTodayDate();
	const endOfDay = getEndOfDay();

	// Reset global counter if new day
	if (data.global.resetDate !== today) {
		data.global = { count: 0, resetDate: today };
	}

	// Check global limit
	if (data.global.count >= MAX_GLOBAL_REQUESTS_PER_DAY) {
		return {
			allowed: false,
			reason: "Daily global limit reached. Please try again tomorrow.",
			resetTime: endOfDay,
		};
	}

	// Increment global counter
	data.global.count += 1;
	saveRateLimitData(data);

	return {
		allowed: true,
		remaining: MAX_GLOBAL_REQUESTS_PER_DAY - data.global.count,
		resetTime: endOfDay,
	};
}

// Request AI generation with cooldown and global limit
export function requestAIGeneration(ip: string): {
	allowed: boolean;
	reason?: string;
	remainingMs?: number;
	remaining?: number;
	resetTime?: number;
} {
	// Check cooldown first
	const cooldownResult = checkCooldown(ip);
	if (!cooldownResult.allowed) {
		return {
			allowed: false,
			reason: `Please wait ${Math.ceil((cooldownResult.remainingMs || 0) / 1000)} seconds before generating again.`,
			remainingMs: cooldownResult.remainingMs,
		};
	}

	// Check global limit
	const globalResult = checkAIRateLimit();
	if (!globalResult.allowed) {
		return {
			allowed: false,
			reason: globalResult.reason,
			resetTime: globalResult.resetTime,
		};
	}

	// Set cooldown for this IP
	setCooldown(ip);

	return {
		allowed: true,
		remaining: globalResult.remaining,
		resetTime: globalResult.resetTime,
	};
}

// Get global rate limit status (without incrementing)
export function getGlobalRateLimitStatus(): {
	remaining: number;
	total: number;
	resetTime: number;
} {
	const data = loadRateLimitData();
	const today = getTodayDate();
	const endOfDay = getEndOfDay();

	// Reset if new day
	if (data.global.resetDate !== today) {
		return {
			remaining: MAX_GLOBAL_REQUESTS_PER_DAY,
			total: MAX_GLOBAL_REQUESTS_PER_DAY,
			resetTime: endOfDay,
		};
	}

	return {
		remaining: Math.max(0, MAX_GLOBAL_REQUESTS_PER_DAY - data.global.count),
		total: MAX_GLOBAL_REQUESTS_PER_DAY,
		resetTime: endOfDay,
	};
}
