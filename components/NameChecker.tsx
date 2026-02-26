"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Check,
	Globe,
	Loader2,
	Plus,
	Search,
	Sparkles,
	X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface DomainResult {
	domain: string;
	tld: string;
	available: boolean | null;
	price: number | null;
	category?: string;
}

interface SocialResult {
	platform: string;
	url: string | null;
	available: boolean | null;
	status: string;
	username?: string;
}

type PriceFilter = "all" | "under10" | "10-30" | "30-50" | "over50";
type CategoryFilter =
	| "all"
	| "generic"
	| "tech"
	| "business"
	| "creative"
	| "ecommerce"
	| "community";
type SortOption = "name" | "price-low" | "price-high";

export default function NameChecker() {
	const [searchNames, setSearchNames] = useState<string[]>([""]);
	const [isChecking, setIsChecking] = useState(false);
	const [isGenerating, setIsGenerating] = useState(false);
	const [domainResults, setDomainResults] = useState<DomainResult[]>([]);
	const [socialResults, setSocialResults] = useState<SocialResult[]>([]);
	const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
	const [selectedSuggestions, setSelectedSuggestions] = useState<Set<string>>(
		new Set(),
	);
	const [activeTab, setActiveTab] = useState<"domains" | "social">("domains");

	const [rateLimitError, setRateLimitError] = useState<string | null>(null);
	const [cooldownSeconds, setCooldownSeconds] = useState(0);

	// Filter states
	const [priceFilter, setPriceFilter] = useState<PriceFilter>("all");
	const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
	const [sortOption, setSortOption] = useState<SortOption>("name");

	// Search progress
	const [searchProgress, setSearchProgress] = useState(0);
	const [searchedNames, setSearchedNames] = useState<string[]>([]);

	// Check cooldown status on mount
	useEffect(() => {
		const checkInitialCooldown = async () => {
			try {
				const res = await fetch("/apps/name-checker/api/check-cooldown");
				const data = await res.json();
				if (data.onCooldown && data.remainingSeconds) {
					setCooldownSeconds(data.remainingSeconds);
				}
			} catch (error) {
				console.error("Error checking cooldown:", error);
			}
		};
		checkInitialCooldown();
	}, []);

	// Cooldown timer effect
	useEffect(() => {
		if (cooldownSeconds <= 0) return;

		const interval = setInterval(() => {
			setCooldownSeconds((prev) => Math.max(0, prev - 1));
		}, 1000);

		return () => clearInterval(interval);
	}, [cooldownSeconds]);

	const addSearchField = () => {
		setSearchNames([...searchNames, ""]);
	};

	const removeSearchField = (index: number) => {
		if (searchNames.length === 1) return;
		setSearchNames(searchNames.filter((_, i) => i !== index));
	};

	const updateSearchField = (index: number, value: string) => {
		const updated = [...searchNames];
		updated[index] = value;
		setSearchNames(updated);
	};

	const handleSearch = async () => {
		const validNames = searchNames.filter((n) => n.trim());
		if (validNames.length === 0) return;

		setIsChecking(true);
		setDomainResults([]);
		setSocialResults([]);
		setSearchProgress(0);
		setSearchedNames(validNames);

		try {
			const totalNames = validNames.length;
			let completed = 0;

			const results = await Promise.all(
				validNames.map(async (name) => {
					// Check domains
					const domainRes = await fetch("/apps/name-checker/api/check-domain", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
					});
					const domainData = await domainRes.json();

					// Check social media
					const socialRes = await fetch("/apps/name-checker/api/check-social", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ username: name }),
					});
					const socialData = await socialRes.json();
					const cleanedName = name.toLowerCase().replace(/[^a-z0-9_.-]/g, "");

					completed++;
					setSearchProgress(Math.round((completed / totalNames) * 100));

					return {
						domains: domainData.results || [],
						socials: (socialData.results || []).map((r: SocialResult) => ({
							...r,
							username: cleanedName,
						})),
					};
				}),
			);

			const allDomains = results.flatMap((r) => r.domains);
			const allSocials = results.flatMap((r) => r.socials);

			setDomainResults(allDomains);
			setSocialResults(allSocials);
		} catch (error) {
			console.error("Search error:", error);
		} finally {
			setIsChecking(false);
			setSearchProgress(0);
		}
	};

	const handleGenerateNames = async () => {
		const validNames = searchNames.filter((n) => n.trim());
		if (validNames.length === 0) return;

		setIsGenerating(true);
		setRateLimitError(null);
		try {
			const res = await fetch("/apps/name-checker/api/generate-names", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: validNames[0], count: 12 }),
			});

			const data = await res.json();

			if (res.status === 429) {
				setRateLimitError(
					data.error || "Rate limit exceeded. Please try again later.",
				);
				// Start cooldown timer if it's a cooldown error
				if (data.error?.includes("wait")) {
					setCooldownSeconds(60);
				}
				return;
			}

			setAiSuggestions(data.suggestions || []);
			setSelectedSuggestions(new Set());
			setRateLimitError(null);

			// Start cooldown timer
			setCooldownSeconds(60);
		} catch (error) {
			console.error("Generation error:", error);
			setRateLimitError("Failed to generate names. Please try again.");
		} finally {
			setIsGenerating(false);
		}
	};

	const toggleSuggestion = (name: string) => {
		const newSelected = new Set(selectedSuggestions);
		if (newSelected.has(name)) {
			newSelected.delete(name);
		} else {
			newSelected.add(name);
		}
		setSelectedSuggestions(newSelected);
	};

	const handleCheckSelected = async () => {
		if (selectedSuggestions.size === 0) return;

		setIsChecking(true);
		const names = Array.from(selectedSuggestions);

		try {
			const results = await Promise.all(
				names.map(async (name) => {
					const res = await fetch("/apps/name-checker/api/check-domain", {
						method: "POST",
						headers: { "Content-Type": "application/json" },
						body: JSON.stringify({ name }),
					});
					return res.json();
				}),
			);

			const allDomains = results.flatMap((r) => r.results || []);
			setDomainResults(allDomains);
			setActiveTab("domains");
		} catch (error) {
			console.error("Bulk check error:", error);
		} finally {
			setIsChecking(false);
		}
	};

	// Filter domains based on price and category
	const filterDomains = (domains: DomainResult[]) => {
		let filtered = [...domains];

		// Apply price filter
		if (priceFilter !== "all") {
			filtered = filtered.filter((d) => {
				if (!d.price) return false;
				switch (priceFilter) {
					case "under10":
						return d.price < 10;
					case "10-30":
						return d.price >= 10 && d.price < 30;
					case "30-50":
						return d.price >= 30 && d.price < 50;
					case "over50":
						return d.price >= 50;
					default:
						return true;
				}
			});
		}

		// Apply category filter
		if (categoryFilter !== "all") {
			filtered = filtered.filter((d) => d.category === categoryFilter);
		}

		// Apply sorting
		filtered.sort((a, b) => {
			switch (sortOption) {
				case "price-low":
					return (a.price || 0) - (b.price || 0);
				case "price-high":
					return (b.price || 0) - (a.price || 0);
				default:
					return a.domain.localeCompare(b.domain);
			}
		});

		return filtered;
	};

	// Export results as CSV
	const exportResults = () => {
		const csvContent = [
			["Type", "Name", "Available", "Price/Platform"],
			...domainResults.map((d) => [
				"Domain",
				d.domain,
				d.available ? "Yes" : "No",
				d.price ? `$${d.price}` : "N/A",
			]),
			...socialResults.map((s) => [
				"Social",
				`@${s.username} (${s.platform})`,
				s.available ? "Yes" : "No",
				s.url || "N/A",
			]),
		]
			.map((row) => row.join(","))
			.join("\n");

		const blob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `name-checker-results-${Date.now()}.csv`;
		document.body.appendChild(a);
		a.click();
		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	};

	const availableDomains = domainResults.filter((d) => d.available === true);
	const takenDomains = domainResults.filter((d) => d.available === false);
	const unknownDomains = domainResults.filter((d) => d.available === null);
	const availableSocial = socialResults.filter((s) => s.available === true);
	const takenSocial = socialResults.filter((s) => s.available === false);
	const unknownSocial = socialResults.filter((s) => s.available === null);

	// Apply filters
	const filteredAvailableDomains = filterDomains(availableDomains);
	const filteredTakenDomains = filterDomains(takenDomains);
	const filteredUnknownDomains = filterDomains(unknownDomains);

	return (
		<div className="min-h-screen bg-white text-black p-4 md:p-8 flex flex-col">
			<div className="max-w-6xl mx-auto w-full flex-grow">
				{/* Header */}
				<motion.div
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					className="text-center mb-12"
				>
					<h1 className="text-5xl md:text-7xl font-bold mb-4 tracking-tight">
						Name Checker
					</h1>
					<p className="text-lg text-gray-600">
						Check domain availability, social media usernames, and generate
						AI-powered brand names
					</p>
				</motion.div>

				{/* Search Bar */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: 0.1 }}
					className="mb-8"
				>
					<div className="max-w-3xl mx-auto space-y-3">
						{/* Search Names Display (when results exist) */}
						{searchedNames.length > 0 && domainResults.length > 0 && (
							<div className="mb-4 p-4 border-2 border-black bg-gray-50">
								<p className="text-sm font-medium mb-2">
									Searched: {searchedNames.join(", ")}
								</p>
							</div>
						)}

						{/* Dynamic Search Fields */}
						{searchNames.map((name, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, x: -20 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.05 }}
								className="flex gap-2"
							>
								<input
									type="text"
									value={name}
									onChange={(e) => updateSearchField(index, e.target.value)}
									onKeyDown={(e) => e.key === "Enter" && handleSearch()}
									placeholder={`Enter brand name ${searchNames.length > 1 ? `#${index + 1}` : ""}...`}
									className="flex-1 px-6 py-4 text-lg border-2 border-black rounded-none focus:outline-none focus:ring-2 focus:ring-black transition-all"
								/>
								{searchNames.length > 1 && (
									<button
										type="button"
										onClick={() => removeSearchField(index)}
										className="px-4 py-4 border-2 border-black hover:bg-black hover:text-white transition-all"
										title="Remove field"
									>
										<X className="w-5 h-5" />
									</button>
								)}
							</motion.div>
						))}

						{/* Add Field and Search Buttons */}
						<div className="flex gap-2">
							<button
								type="button"
								onClick={addSearchField}
								disabled={isChecking}
								className="flex items-center gap-2 px-6 py-3 border-2 border-black hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
							>
								<Plus className="w-5 h-5" />
								Add Name
							</button>
							<button
								type="button"
								onClick={handleSearch}
								disabled={isChecking || searchNames.every((n) => !n.trim())}
								className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors hover:bg-gray-800"
							>
								{isChecking ? (
									<>
										<Loader2 className="w-5 h-5 animate-spin" />
										Checking... {searchProgress > 0 && `${searchProgress}%`}
									</>
								) : (
									<>
										<Search className="w-5 h-5" />
										Check {searchNames.filter((n) => n.trim()).length > 1 ? `${searchNames.filter((n) => n.trim()).length} Names` : "Name"}
									</>
								)}
							</button>
						</div>

						{/* Generate Names Button */}
						<div className="flex flex-col items-center gap-2">
							<button
								type="button"
								onClick={handleGenerateNames}
								disabled={
									isGenerating ||
									searchNames.every((n) => !n.trim()) ||
									cooldownSeconds > 0
								}
								className="flex items-center gap-2 px-6 py-2 border-2 border-black hover:bg-black hover:text-white disabled:border-gray-300 disabled:text-gray-300 disabled:cursor-not-allowed transition-all"
							>
								{isGenerating ? (
									<Loader2 className="w-4 h-4 animate-spin" />
								) : (
									<Sparkles className="w-4 h-4" />
								)}
								{cooldownSeconds > 0
									? `Wait ${cooldownSeconds}s...`
									: "Generate Similar Names"}
							</button>
							{rateLimitError && (
								<p className="text-sm font-medium">⚠️ {rateLimitError}</p>
							)}
						</div>
					</div>
				</motion.div>

				{/* AI Suggestions */}
				<AnimatePresence>
					{aiSuggestions.length > 0 && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							exit={{ opacity: 0, height: 0 }}
							className="mb-8 border-2 border-black p-6"
						>
							<div className="flex justify-between items-center mb-4">
								<div>
									<h2 className="text-2xl font-bold">AI Suggestions</h2>
									<p className="text-sm text-gray-600 mt-1">
										{aiSuggestions.length} names generated • Click to select
									</p>
								</div>
								<div className="flex gap-2">
									<button
										type="button"
										onClick={() => {
											if (selectedSuggestions.size === aiSuggestions.length) {
												setSelectedSuggestions(new Set());
											} else {
												setSelectedSuggestions(new Set(aiSuggestions));
											}
										}}
										className="px-4 py-2 border-2 border-black hover:bg-gray-100 transition-colors text-sm"
									>
										{selectedSuggestions.size === aiSuggestions.length
											? "Deselect All"
											: "Select All"}
									</button>
									{selectedSuggestions.size > 0 && (
										<button
											type="button"
											onClick={handleCheckSelected}
											disabled={isChecking}
											className="flex items-center gap-2 px-4 py-2 bg-black text-white hover:bg-gray-800 disabled:bg-gray-400 transition-colors"
										>
											{isChecking ? (
												<>
													<Loader2 className="w-4 h-4 animate-spin" />
													Checking...
												</>
											) : (
												<>
													<Search className="w-4 h-4" />
													Check Selected ({selectedSuggestions.size})
												</>
											)}
										</button>
									)}
								</div>
							</div>
							<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
								{aiSuggestions.map((name, index) => (
									<motion.button
										key={name}
										type="button"
										initial={{ opacity: 0, scale: 0.9 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{ delay: index * 0.05 }}
										onClick={() => toggleSuggestion(name)}
										className={`px-4 py-3 border-2 border-black text-left transition-all font-medium ${
											selectedSuggestions.has(name)
												? "bg-black text-white"
												: "bg-white hover:bg-gray-100"
										}`}
									>
										<div className="flex justify-between items-center">
											<span>{name}</span>
											{selectedSuggestions.has(name) && (
												<Check className="w-4 h-4" />
											)}
										</div>
									</motion.button>
								))}
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				{/* Results */}
				{(domainResults.length > 0 || socialResults.length > 0) && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						{/* Tabs */}
						<div className="flex border-b-2 border-black mb-6">
							<button
								type="button"
								onClick={() => setActiveTab("domains")}
								className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
									activeTab === "domains"
										? "bg-black text-white"
										: "bg-white text-black hover:bg-gray-100"
								}`}
							>
								<Globe className="w-4 h-4" />
								Domains ({availableDomains.length}/{domainResults.length})
							</button>
							<button
								type="button"
								onClick={() => setActiveTab("social")}
								className={`flex items-center gap-2 px-6 py-3 font-medium transition-colors ${
									activeTab === "social"
										? "bg-black text-white"
										: "bg-white text-black hover:bg-gray-100"
								}`}
							>
								Social ({availableSocial.length}/{socialResults.length})
							</button>
							<button
								type="button"
								onClick={exportResults}
								className="ml-auto flex items-center gap-2 px-4 py-3 border-l-2 border-black hover:bg-gray-100 transition-colors text-sm"
							>
								Export CSV
							</button>
						</div>

						{/* Filters - Show only on domains tab */}
						{activeTab === "domains" && domainResults.length > 0 && (
							<div className="mb-6 p-4 border-2 border-gray-200">
								<div className="flex justify-between items-center mb-3">
									<h3 className="font-bold text-lg">Filters & Sort</h3>
									<button
										type="button"
										onClick={() => {
											setPriceFilter("all");
											setCategoryFilter("all");
											setSortOption("name");
										}}
										className="text-sm text-gray-600 hover:text-black"
									>
										Reset Filters
									</button>
								</div>
								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									{/* Price Filter */}
									<div>
										<label className="block text-sm font-medium mb-2">
											Price Range
											<select
												value={priceFilter}
												onChange={(e) =>
													setPriceFilter(e.target.value as PriceFilter)
												}
												className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black mt-2"
											>
												<option value="all">All Prices</option>
												<option value="under10">Under $10</option>
												<option value="10-30">$10 - $30</option>
												<option value="30-50">$30 - $50</option>
												<option value="over50">Over $50</option>
											</select>
										</label>
									</div>

									{/* Category Filter */}
									<div>
										<label className="block text-sm font-medium mb-2">
											Category
											<select
												value={categoryFilter}
												onChange={(e) =>
													setCategoryFilter(e.target.value as CategoryFilter)
												}
												className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black mt-2"
											>
												<option value="all">All Categories</option>
												<option value="generic">
													Generic (.com, .net, .org)
												</option>
												<option value="tech">Tech (.io, .ai, .dev)</option>
												<option value="business">Business (.co, .biz)</option>
												<option value="creative">
													Creative (.design, .studio)
												</option>
												<option value="ecommerce">
													E-commerce (.shop, .store)
												</option>
												<option value="community">
													Community (.club, .social)
												</option>
											</select>
										</label>
									</div>

									{/* Sort Option */}
									<div>
										<label className="block text-sm font-medium mb-2">
											Sort By
											<select
												value={sortOption}
												onChange={(e) =>
													setSortOption(e.target.value as SortOption)
												}
												className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-black mt-2"
											>
												<option value="name">Name (A-Z)</option>
												<option value="price-low">Price (Low to High)</option>
												<option value="price-high">Price (High to Low)</option>
											</select>
										</label>
									</div>
								</div>
							</div>
						)}

						{/* Domain Results */}
						{activeTab === "domains" && (
							<div className="space-y-6">
								{filteredAvailableDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<Check className="w-5 h-5" /> Available Domains (
											{filteredAvailableDomains.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{filteredAvailableDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-black bg-white"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{domain.domain}</p>
															<div className="flex items-center gap-2 mt-1">
																{domain.price && (
																	<p className="text-sm text-gray-600">
																		${domain.price}/year
																	</p>
																)}
																{domain.category && (
																	<span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700">
																		{domain.category}
																	</span>
																)}
															</div>
														</div>
														<Check className="w-5 h-5 " />
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{filteredTakenDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<X className="w-5 h-5" /> Taken Domains (
											{filteredTakenDomains.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{filteredTakenDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-gray-50 text-gray-500"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold line-through">
																{domain.domain}
															</p>
															<div className="flex items-center gap-2 mt-1">
																{domain.price && (
																	<p className="text-sm">
																		${domain.price}/year
																	</p>
																)}
																{domain.category && (
																	<span className="text-xs px-2 py-0.5 bg-gray-300 text-gray-600">
																		{domain.category}
																	</span>
																)}
															</div>
														</div>
														<X className="w-5 h-5 " />
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{filteredUnknownDomains.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											Unknown Status ({filteredUnknownDomains.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{filteredUnknownDomains.map((domain, index) => (
												<motion.div
													key={domain.domain}
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-white text-gray-700"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{domain.domain}</p>
															<div className="flex items-center gap-2 mt-1">
																{domain.price && (
																	<p className="text-sm text-gray-600">
																		${domain.price}/year
																	</p>
																)}
																{domain.category && (
																	<span className="text-xs px-2 py-0.5 bg-gray-200 text-gray-700">
																		{domain.category}
																	</span>
																)}
															</div>
														</div>
														<span className="text-sm text-gray-500">?</span>
													</div>
												</motion.div>
											))}
										</div>
									</div>
								)}

								{filteredAvailableDomains.length === 0 &&
									filteredTakenDomains.length === 0 &&
									filteredUnknownDomains.length === 0 &&
									domainResults.length > 0 && (
										<div className="text-center py-8 text-gray-500">
											<p>No domains match the current filters.</p>
											<button
												type="button"
												onClick={() => {
													setPriceFilter("all");
													setCategoryFilter("all");
												}}
												className="mt-2 text-sm text-black hover:underline"
											>
												Reset filters
											</button>
										</div>
									)}
							</div>
						)}

						{/* Social Media Results */}
						{activeTab === "social" && (
							<div className="space-y-6">
								{availableSocial.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<Check className="w-5 h-5" /> Available Usernames (
											{availableSocial.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{availableSocial.map((social, index) => (
												<motion.a
													key={`${social.platform}-${social.username}`}
													href={social.url || "#"}
													target="_blank"
													rel="noopener noreferrer"
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{social.platform}</p>
															<p className="text-sm text-gray-600 mt-1">
																@{social.username}
															</p>
														</div>
														<Check className="w-5 h-5" />
													</div>
												</motion.a>
											))}
										</div>
									</div>
								)}

								{takenSocial.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											<X className="w-5 h-5" /> Taken Usernames (
											{takenSocial.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{takenSocial.map((social, index) => (
												<motion.a
													key={`${social.platform}-${social.username}`}
													href={social.url || "#"}
													target="_blank"
													rel="noopener noreferrer"
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-gray-50 text-gray-500 hover:bg-gray-100 transition-colors"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold line-through">
																{social.platform}
															</p>
															<p className="text-sm mt-1">@{social.username}</p>
														</div>
														<X className="w-5 h-5" />
													</div>
												</motion.a>
											))}
										</div>
									</div>
								)}

								{unknownSocial.length > 0 && (
									<div>
										<h3 className="text-xl font-bold mb-3 flex items-center gap-2">
											Unknown Status ({unknownSocial.length})
										</h3>
										<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
											{unknownSocial.map((social, index) => (
												<motion.a
													key={`${social.platform}-${social.username}`}
													href={social.url || "#"}
													target="_blank"
													rel="noopener noreferrer"
													initial={{ opacity: 0, x: -20 }}
													animate={{ opacity: 1, x: 0 }}
													transition={{ delay: index * 0.05 }}
													className="p-4 border-2 border-gray-300 bg-white text-gray-700"
												>
													<div className="flex justify-between items-start">
														<div>
															<p className="font-bold">{social.platform}</p>
															<p className="text-sm text-gray-600 mt-1">
																@{social.username}
															</p>
														</div>
														<span className="text-sm text-gray-500">?</span>
													</div>
												</motion.a>
											))}
										</div>
									</div>
								)}
							</div>
						)}
					</motion.div>
				)}

				{/* Empty State */}
				{!isChecking &&
					domainResults.length === 0 &&
					socialResults.length === 0 && (
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							className="text-center py-20 text-gray-400"
						>
							<p className="text-lg">
								Enter a brand name to check availability
							</p>
						</motion.div>
					)}
			</div>

			{/* Footer */}
			<footer className="w-full max-w-6xl mx-auto mt-16 pt-8 border-t-2 border-gray-200">
				<div className="text-center text-gray-600 space-y-2">
					<p className="text-sm">
						Open source on{" "}
						<a
							href="https://github.com/1-kabir/name-checker"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-black hover:underline transition-all"
						>
							GitHub
						</a>
					</p>
					<p className="text-sm md:text-base">
						Made with{" "}
						<span className="text-red-500 animate-pulse inline-block">❤</span>{" "}
						by{" "}
						<a
							href="https://www.kabirstudios.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="font-semibold text-black hover:underline transition-all"
						>
							Kabir
						</a>
					</p>
				</div>
			</footer>
		</div>
	);
}
