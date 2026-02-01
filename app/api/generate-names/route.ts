import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { getClientIP, requestAIGeneration } from "@/lib/rateLimit";

export async function POST(request: Request) {
	try {
		// Check cooldown and global limit
		const ip = getClientIP(request.headers);
		const limitResult = requestAIGeneration(ip);

		if (!limitResult.allowed) {
			return NextResponse.json(
				{
					error: limitResult.reason || "Rate limit exceeded",
					resetTime: limitResult.resetTime
						? new Date(limitResult.resetTime).toISOString()
						: undefined,
				},
				{
					status: 429,
					headers: {
						"Retry-After": String(
							Math.ceil((limitResult.remainingMs || 60000) / 1000),
						),
					},
				},
			);
		}

		const { name, count = 10 } = await request.json();

		if (!name || !name.trim()) {
			return NextResponse.json({ error: "Name is required" }, { status: 400 });
		}

		if (!process.env.GROQ_API_KEY) {
			return NextResponse.json(
				{ error: "Groq API key not configured" },
				{ status: 500 },
			);
		}

		const groq = new Groq({
			apiKey: process.env.GROQ_API_KEY,
		});

		const prompt = `Generate ${count} creative and brandable alternative names similar to "${name}". 
		
Rules:
- Each name should be 2-15 characters long
- Easy to pronounce and remember
- Suitable for a brand/company name
- Mix of variations (slight modifications, synonyms, related words, combinations)
- Should be unique and catchy

Return ONLY a JSON array of strings with the alternative names. Example format:
["name1", "name2", "name3", ...]

Do not include any explanation or additional text, just the JSON array.`;

		const completion = await groq.chat.completions.create({
			messages: [
				{
					role: "user",
					content: prompt,
				},
			],
			model: "llama-3.3-70b-versatile",
			temperature: 0.8,
			max_tokens: 1024,
		});

		const responseText = completion.choices[0]?.message?.content || "[]";

		// Parse the JSON response
		let suggestions: string[];
		try {
			// Try to extract JSON array from response
			const jsonMatch = responseText.match(/\[[\s\S]*\]/);
			if (jsonMatch) {
				suggestions = JSON.parse(jsonMatch[0]);
			} else {
				suggestions = JSON.parse(responseText);
			}
		} catch (_parseError) {
			console.error("Failed to parse AI response");
			// Fallback: try to extract names from text
			suggestions = responseText
				.split(/[\n,]/)
				.map((s) => s.trim().replace(/^["']|["']$/g, ""))
				.filter((s) => s && s.length > 0 && s.length < 30)
				.slice(0, count);
		}

		// Ensure we have valid suggestions
		if (!Array.isArray(suggestions) || suggestions.length === 0) {
			suggestions = [name]; // Fallback to original name
		}

		return NextResponse.json(
			{ suggestions: suggestions.slice(0, count) },
			{
				headers: {
					"X-RateLimit-Remaining": String(limitResult.remaining || 0),
					"X-RateLimit-Reset": String(limitResult.resetTime || 0),
				},
			},
		);
	} catch (error) {
		console.error("Name generation error:", error);
		return NextResponse.json(
			{ error: "Failed to generate name suggestions" },
			{ status: 500 },
		);
	}
}
