import { NextResponse } from "next/server";

// Top 20+ social media platforms with their API/check methods
const SOCIAL_PLATFORMS = [
	{ name: "Twitter/X", url: "https://x.com/", checkUrl: "https://x.com/" },
	{
		name: "Instagram",
		url: "https://www.instagram.com/",
		checkUrl: "https://www.instagram.com/",
	},
	{
		name: "Facebook",
		url: "https://www.facebook.com/",
		checkUrl: "https://www.facebook.com/",
	},
	{
		name: "YouTube",
		url: "https://www.youtube.com/@",
		checkUrl: "https://www.youtube.com/@",
	},
	{
		name: "TikTok",
		url: "https://www.tiktok.com/@",
		checkUrl: "https://www.tiktok.com/@",
	},
	{
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/",
		checkUrl: "https://www.linkedin.com/in/",
	},
	{
		name: "GitHub",
		url: "https://github.com/",
		checkUrl: "https://github.com/",
	},
	{
		name: "Reddit",
		url: "https://www.reddit.com/user/",
		checkUrl: "https://www.reddit.com/user/",
	},
	{
		name: "Pinterest",
		url: "https://www.pinterest.com/",
		checkUrl: "https://www.pinterest.com/",
	},
	{
		name: "Snapchat",
		url: "https://www.snapchat.com/add/",
		checkUrl: "https://www.snapchat.com/add/",
	},
	{ name: "Discord", url: "https://discord.com/users/", checkUrl: null }, // Can't easily check
	{
		name: "Twitch",
		url: "https://www.twitch.tv/",
		checkUrl: "https://www.twitch.tv/",
	},
	{
		name: "Medium",
		url: "https://medium.com/@",
		checkUrl: "https://medium.com/@",
	},
	{
		name: "Dribbble",
		url: "https://dribbble.com/",
		checkUrl: "https://dribbble.com/",
	},
	{
		name: "Behance",
		url: "https://www.behance.net/",
		checkUrl: "https://www.behance.net/",
	},
	{ name: "Vimeo", url: "https://vimeo.com/", checkUrl: "https://vimeo.com/" },
	{ name: "Telegram", url: "https://t.me/", checkUrl: "https://t.me/" },
	{ name: "WhatsApp", url: null, checkUrl: null }, // Not publicly checkable
	{ name: "Mastodon", url: "https://mastodon.social/@", checkUrl: null },
	{
		name: "Threads",
		url: "https://www.threads.net/@",
		checkUrl: "https://www.threads.net/@",
	},
];

async function checkUsername(
	username: string,
	platform: (typeof SOCIAL_PLATFORMS)[0],
) {
	// If no check URL, we can't verify
	if (!platform.checkUrl) {
		return {
			platform: platform.name,
			url: platform.url ? `${platform.url}${username}` : null,
			available: null,
			status: "unknown",
		};
	}

	try {
		const checkUrl = `${platform.checkUrl}${username}`;

		// Make a HEAD request to check if the profile exists
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

		const response = await fetch(checkUrl, {
			method: "HEAD",
			signal: controller.signal,
			redirect: "manual", // Don't follow redirects
		});

		clearTimeout(timeoutId);

		// If we get 200 or 302, profile likely exists (taken)
		// If we get 404, profile doesn't exist (available)
		const available = response.status === 404;

		return {
			platform: platform.name,
			url: checkUrl,
			available,
			status: available ? "available" : "taken",
		};
	} catch (_error) {
		// If request fails, mark as unknown
		return {
			platform: platform.name,
			url: platform.url ? `${platform.url}${username}` : null,
			available: null,
			status: "error",
		};
	}
}

export async function POST(request: Request) {
	try {
		const { username } = await request.json();

		if (!username || !username.trim()) {
			return NextResponse.json(
				{ error: "Username is required" },
				{ status: 400 },
			);
		}

		// Clean the username
		const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

		// Check all platforms in parallel
		const results = await Promise.all(
			SOCIAL_PLATFORMS.map((platform) =>
				checkUsername(cleanUsername, platform),
			),
		);

		return NextResponse.json({ results });
	} catch (error) {
		console.error("Social check error:", error);
		return NextResponse.json(
			{ error: "Failed to check social media availability" },
			{ status: 500 },
		);
	}
}
