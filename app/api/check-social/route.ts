import { NextResponse } from "next/server";

// Comprehensive social media platforms list (40+ platforms)
const SOCIAL_PLATFORMS = [
	// Major Social Networks
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
		name: "LinkedIn",
		url: "https://www.linkedin.com/in/",
		checkUrl: "https://www.linkedin.com/in/",
	},
	{
		name: "TikTok",
		url: "https://www.tiktok.com/@",
		checkUrl: "https://www.tiktok.com/@",
	},
	{
		name: "Threads",
		url: "https://www.threads.net/@",
		checkUrl: "https://www.threads.net/@",
	},

	// Content Platforms
	{
		name: "YouTube",
		url: "https://www.youtube.com/@",
		checkUrl: "https://www.youtube.com/@",
	},
	{
		name: "Twitch",
		url: "https://www.twitch.tv/",
		checkUrl: "https://www.twitch.tv/",
	},
	{ name: "Vimeo", url: "https://vimeo.com/", checkUrl: "https://vimeo.com/" },

	// Developer Platforms
	{
		name: "GitHub",
		url: "https://github.com/",
		checkUrl: "https://github.com/",
	},
	{
		name: "GitLab",
		url: "https://gitlab.com/",
		checkUrl: "https://gitlab.com/",
	},
	{
		name: "Bitbucket",
		url: "https://bitbucket.org/",
		checkUrl: "https://bitbucket.org/",
	},
	{
		name: "Dev.to",
		url: "https://dev.to/",
		checkUrl: "https://dev.to/",
	},
	{
		name: "CodePen",
		url: "https://codepen.io/",
		checkUrl: "https://codepen.io/",
	},
	{
		name: "Stack Overflow",
		url: "https://stackoverflow.com/users/",
		checkUrl: null, // Different URL structure
	},
	{
		name: "Repl.it",
		url: "https://replit.com/@",
		checkUrl: "https://replit.com/@",
	},

	// Creative & Design Platforms
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
	{
		name: "Pinterest",
		url: "https://www.pinterest.com/",
		checkUrl: "https://www.pinterest.com/",
	},
	{
		name: "Figma",
		url: "https://www.figma.com/@",
		checkUrl: "https://www.figma.com/@",
	},

	// Blogging & Writing Platforms
	{
		name: "Medium",
		url: "https://medium.com/@",
		checkUrl: "https://medium.com/@",
	},
	{
		name: "Substack",
		url: "https://substack.com/@",
		checkUrl: "https://substack.com/@",
	},
	{
		name: "Hashnode",
		url: "https://hashnode.com/@",
		checkUrl: "https://hashnode.com/@",
	},
	{
		name: "Tumblr",
		url: "https://www.tumblr.com/",
		checkUrl: "https://www.tumblr.com/",
	},

	// Community & Forums
	{
		name: "Reddit",
		url: "https://www.reddit.com/user/",
		checkUrl: "https://www.reddit.com/user/",
	},
	{ name: "Discord", url: "https://discord.com/users/", checkUrl: null },
	{
		name: "Product Hunt",
		url: "https://www.producthunt.com/@",
		checkUrl: "https://www.producthunt.com/@",
	},
	{
		name: "Indie Hackers",
		url: "https://www.indiehackers.com/",
		checkUrl: "https://www.indiehackers.com/",
	},

	// Creator & Funding Platforms
	{
		name: "Patreon",
		url: "https://www.patreon.com/",
		checkUrl: "https://www.patreon.com/",
	},
	{
		name: "Ko-fi",
		url: "https://ko-fi.com/",
		checkUrl: "https://ko-fi.com/",
	},
	{
		name: "Buy Me a Coffee",
		url: "https://www.buymeacoffee.com/",
		checkUrl: "https://www.buymeacoffee.com/",
	},

	// Music & Audio Platforms
	{
		name: "Spotify",
		url: "https://open.spotify.com/user/",
		checkUrl: null, // Complex auth required
	},
	{
		name: "SoundCloud",
		url: "https://soundcloud.com/",
		checkUrl: "https://soundcloud.com/",
	},
	{
		name: "Bandcamp",
		url: "https://bandcamp.com/",
		checkUrl: null, // Complex structure
	},

	// Photography & Visual
	{
		name: "Flickr",
		url: "https://www.flickr.com/photos/",
		checkUrl: "https://www.flickr.com/photos/",
	},
	{
		name: "500px",
		url: "https://500px.com/p/",
		checkUrl: "https://500px.com/p/",
	},
	{
		name: "Unsplash",
		url: "https://unsplash.com/@",
		checkUrl: "https://unsplash.com/@",
	},

	// Messaging & Chat
	{ name: "Telegram", url: "https://t.me/", checkUrl: "https://t.me/" },
	{
		name: "Snapchat",
		url: "https://www.snapchat.com/add/",
		checkUrl: "https://www.snapchat.com/add/",
	},
	{ name: "WhatsApp", url: null, checkUrl: null },
	{ name: "Mastodon", url: "https://mastodon.social/@", checkUrl: null },

	// Other Popular Platforms
	{
		name: "Keybase",
		url: "https://keybase.io/",
		checkUrl: "https://keybase.io/",
	},
	{
		name: "Linktree",
		url: "https://linktr.ee/",
		checkUrl: "https://linktr.ee/",
	},
	{
		name: "AboutMe",
		url: "https://about.me/",
		checkUrl: "https://about.me/",
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

		// Make a GET request to check if the profile exists
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

		const response = await fetch(checkUrl, {
			method: "GET",
			signal: controller.signal,
			redirect: "follow", // Follow redirects to see final destination
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
			},
		});

		clearTimeout(timeoutId);

		// Platform-specific logic
		let available = false;

		// Most platforms return 404 for non-existent profiles
		if (response.status === 404) {
			available = true;
		}
		// Some platforms return 200 but show "not found" page
		else if (response.status === 200) {
			const text = await response.text();
			const lowerText = text.toLowerCase();

			// Check for common "not found" indicators
			const notFoundIndicators = [
				"page not found",
				"user not found",
				"profile not found",
				"doesn't exist",
				"isn't available",
				"this account doesn't exist",
				"sorry, this page isn't available",
				"the page you requested was not found",
				"this page is no longer available",
			];

			available = notFoundIndicators.some((indicator) =>
				lowerText.includes(indicator),
			);
		}
		// Redirects to error/login page might indicate availability
		else if ([301, 302, 303].includes(response.status)) {
			const location = response.headers.get("location") || "";
			// If redirected to home, login, or error page, likely available
			if (
				location.includes("/login") ||
				location.includes("/signup") ||
				location === "/"
			) {
				available = true;
			}
		}

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
