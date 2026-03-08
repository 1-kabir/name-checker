import { NextResponse } from "next/server";

// Check strategies:
// "github_api"  – GET https://api.github.com/users/{} → 404 = available
// "gitlab_api"  – GET https://gitlab.com/api/v4/users?username={} → empty [] = available
// "reddit_api"  – GET https://www.reddit.com/user/{}/about.json → 404 = available
// "devto_api"   – GET https://dev.to/api/users/by_username?url={} → 404 = available
// "http_404"    – plain HEAD/GET request, 404 = available
// "manual"      – cannot reliably check (auth required / heavy bot protection); show link only

interface Platform {
name: string;
url: string; // profile URL prefix (username appended)
checkType:
| "github_api"
| "gitlab_api"
| "reddit_api"
| "devto_api"
| "http_404"
| "manual";
checkUrl?: string; // if different from url
}

const SOCIAL_PLATFORMS: Platform[] = [
// ─── Tier 1: JSON API checks (most reliable) ───
{
name: "GitHub",
url: "https://github.com/",
checkType: "github_api",
},
{
name: "GitLab",
url: "https://gitlab.com/",
checkType: "gitlab_api",
},
{
name: "Reddit",
url: "https://www.reddit.com/user/",
checkType: "reddit_api",
},
{
name: "Dev.to",
url: "https://dev.to/",
checkType: "devto_api",
},

// ─── Tier 2: HTTP 404 checks ───
{
name: "Keybase",
url: "https://keybase.io/",
checkType: "http_404",
},
{
name: "Dribbble",
url: "https://dribbble.com/",
checkType: "http_404",
},
{
name: "Behance",
url: "https://www.behance.net/",
checkType: "http_404",
},
{
name: "Ko-fi",
url: "https://ko-fi.com/",
checkType: "http_404",
},
{
name: "Patreon",
url: "https://www.patreon.com/",
checkType: "http_404",
},
{
name: "SoundCloud",
url: "https://soundcloud.com/",
checkType: "http_404",
},
{
name: "Linktree",
url: "https://linktr.ee/",
checkType: "http_404",
},
{
name: "Twitch",
url: "https://www.twitch.tv/",
checkType: "http_404",
},
{
name: "Pinterest",
url: "https://www.pinterest.com/",
checkType: "http_404",
checkUrl: "https://www.pinterest.com/",
},
{
name: "Unsplash",
url: "https://unsplash.com/@",
checkType: "http_404",
},
{
name: "Product Hunt",
url: "https://www.producthunt.com/@",
checkType: "http_404",
},
{
name: "Indie Hackers",
url: "https://www.indiehackers.com/",
checkType: "http_404",
},
{
name: "Buy Me a Coffee",
url: "https://www.buymeacoffee.com/",
checkType: "http_404",
},
{
name: "Hashnode",
url: "https://hashnode.com/@",
checkType: "http_404",
},
{
name: "Substack",
url: "https://substack.com/@",
checkType: "http_404",
},
{
name: "Medium",
url: "https://medium.com/@",
checkType: "http_404",
},
{
name: "Replit",
url: "https://replit.com/@",
checkType: "http_404",
},
{
name: "CodePen",
url: "https://codepen.io/",
checkType: "http_404",
},
{
name: "Flickr",
url: "https://www.flickr.com/photos/",
checkType: "http_404",
},
{
name: "500px",
url: "https://500px.com/p/",
checkType: "http_404",
},

// ─── Tier 3: Manual check required ───
// (auth required, JS-rendered, or aggressive bot protection)
{
name: "Twitter / X",
url: "https://x.com/",
checkType: "manual",
},
{
name: "Instagram",
url: "https://www.instagram.com/",
checkType: "manual",
},
{
name: "TikTok",
url: "https://www.tiktok.com/@",
checkType: "manual",
},
{
name: "YouTube",
url: "https://www.youtube.com/@",
checkType: "manual",
},
{
name: "LinkedIn",
url: "https://www.linkedin.com/in/",
checkType: "manual",
},
{
name: "Facebook",
url: "https://www.facebook.com/",
checkType: "manual",
},
{
name: "Threads",
url: "https://www.threads.net/@",
checkType: "manual",
},
{
name: "Snapchat",
url: "https://www.snapchat.com/add/",
checkType: "manual",
},
{
name: "Discord",
url: "https://discord.com/",
checkType: "manual",
},
{
name: "Telegram",
url: "https://t.me/",
checkType: "manual",
},
{
name: "Bluesky",
url: "https://bsky.app/profile/",
checkType: "manual",
},
{
name: "Mastodon",
url: "https://mastodon.social/@",
checkType: "manual",
},
{
name: "Tumblr",
url: "https://www.tumblr.com/",
checkType: "manual",
},
{
name: "Vimeo",
url: "https://vimeo.com/",
checkType: "manual",
},
];

const REQUEST_HEADERS = {
"User-Agent":
"Mozilla/5.0 (compatible; NameChecker/1.0; +https://kabirstudios.com/apps/name-checker)",
Accept: "application/json, text/html",
};

async function checkGitHub(username: string): Promise<boolean | null> {
const res = await fetch(`https://api.github.com/users/${username}`, {
headers: { ...REQUEST_HEADERS, Accept: "application/vnd.github+json" },
signal: AbortSignal.timeout(8000),
});
if (res.status === 404) return true; // available
if (res.status === 200) return false; // taken
return null;
}

async function checkGitLab(username: string): Promise<boolean | null> {
const res = await fetch(
`https://gitlab.com/api/v4/users?username=${encodeURIComponent(username)}`,
{
headers: REQUEST_HEADERS,
signal: AbortSignal.timeout(8000),
},
);
if (res.status === 200) {
const data = await res.json();
return Array.isArray(data) && data.length === 0; // empty = available
}
return null;
}

async function checkReddit(username: string): Promise<boolean | null> {
const res = await fetch(
`https://www.reddit.com/user/${encodeURIComponent(username)}/about.json`,
{
headers: {
...REQUEST_HEADERS,
"User-Agent": "NameChecker:1.0 (by /u/namechecker)",
},
signal: AbortSignal.timeout(8000),
},
);
if (res.status === 404) return true;
if (res.status === 200) return false;
return null;
}

async function checkDevTo(username: string): Promise<boolean | null> {
const res = await fetch(
`https://dev.to/api/users/by_username?url=${encodeURIComponent(username)}`,
{
headers: REQUEST_HEADERS,
signal: AbortSignal.timeout(8000),
},
);
if (res.status === 404) return true;
if (res.status === 200) return false;
return null;
}

async function checkHttp404(
username: string,
platform: Platform,
): Promise<boolean | null> {
const url = `${platform.checkUrl ?? platform.url}${username}`;
const res = await fetch(url, {
method: "HEAD",
headers: REQUEST_HEADERS,
redirect: "manual",
signal: AbortSignal.timeout(8000),
});
if (res.status === 404) return true;
if (res.status === 200) return false;
// Some sites redirect to login/home for taken users
if ([301, 302, 303, 307, 308].includes(res.status)) {
const loc = res.headers.get("location") ?? "";
if (
loc.includes("/login") ||
loc.includes("/signup") ||
loc === "/" ||
loc.endsWith(".com/") ||
loc.endsWith(".io/")
)
return true; // redirected away → likely available
return false; // redirected to a user-specific page → taken
}
return null;
}

async function checkUsername(username: string, platform: Platform) {
const profileUrl = `${platform.url}${username}`;

if (platform.checkType === "manual") {
return {
platform: platform.name,
url: profileUrl,
available: null,
status: "manual",
};
}

try {
let available: boolean | null = null;

switch (platform.checkType) {
case "github_api":
available = await checkGitHub(username);
break;
case "gitlab_api":
available = await checkGitLab(username);
break;
case "reddit_api":
available = await checkReddit(username);
break;
case "devto_api":
available = await checkDevTo(username);
break;
case "http_404":
available = await checkHttp404(username, platform);
break;
}

return {
platform: platform.name,
url: profileUrl,
available,
status:
available === true
? "available"
: available === false
? "taken"
: "unknown",
};
} catch {
return {
platform: platform.name,
url: profileUrl,
available: null,
status: "error",
};
}
}

export async function POST(request: Request) {
try {
const { username } = await request.json();

if (!username?.trim()) {
return NextResponse.json(
{ error: "Username is required" },
{ status: 400 },
);
}

const cleanUsername = username.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

// Run all checks concurrently
const results = await Promise.all(
SOCIAL_PLATFORMS.map((p) => checkUsername(cleanUsername, p)),
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
