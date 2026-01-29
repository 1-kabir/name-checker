# Name Checker 🔍

A powerful web application to check domain availability across popular TLDs, verify social media username availability on 20+ platforms, and generate AI-powered brand name suggestions. Perfect for entrepreneurs, startups, and businesses looking for the perfect brand name.

## ✨ Features

- 🌐 **Domain Availability Check** - Check availability across 10+ popular TLDs (com, net, org, io, ai, etc.) with pricing information
- 📱 **Social Media Username Check** - Verify username availability on 20+ platforms including Twitter/X, Instagram, Facebook, GitHub, LinkedIn, TikTok, and more
- 🤖 **AI-Powered Name Generation** - Generate creative brand name suggestions using Groq's AI models
- 🚀 **Fast & Responsive** - Built with Next.js 16 for optimal performance
- 🎨 **Modern UI** - Clean, minimalist design with smooth animations
- 🛡️ **Bot Protection** - Built-in rate limiting to prevent abuse
- 📊 **SEO Optimized** - Comprehensive SEO setup for maximum visibility

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ or Docker
- Groq API key (free at [console.groq.com](https://console.groq.com/))

### Option 1: Docker Compose (Recommended)

The easiest way to get started with Docker:

1. **Clone the repository**
   ```bash
   git clone https://github.com/1-kabir/name-checker.git
   cd name-checker
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Edit `.env` and add your Groq API key**
   ```env
   PORT=3000
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

4. **Start the application**
   ```bash
   docker-compose up -d
   ```

5. **Access the app**
   - Open your browser to `http://localhost:3000`
   - To use a different port, change `PORT` in `.env` file

6. **Stop the application**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Add your Groq API key to `.env`**
   ```env
   GROQ_API_KEY=your_actual_groq_api_key_here
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## 🛠️ Tech Stack

- **[Next.js 16](https://nextjs.org/)** - React framework with App Router
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[TailwindCSS v4](https://tailwindcss.com/)** - Utility-first CSS framework
- **[shadcn/ui](https://ui.shadcn.com/)** - High-quality UI components
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library
- **[Groq SDK](https://console.groq.com/)** - AI-powered name generation
- **[Biome](https://biomejs.dev/)** - Fast linter and formatter

## 📝 Available Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm start        # Start production server
npm run lint     # Run Biome linter
npm run format   # Format code with Biome
```

## 🐳 Docker Configuration

### Changing the Port

Edit the `.env` file:
```env
PORT=8080  # Use any port you want
```

Then restart the container:
```bash
docker-compose down
docker-compose up -d
```

### Building for Production

```bash
# Build the Docker image
docker build -t name-checker .

# Run the container
docker run -p 3000:3000 -e GROQ_API_KEY=your_key name-checker
```

## 🔒 Security Features

### Rate Limiting

The application includes built-in rate limiting to prevent bot abuse:
- **20 requests per minute** per IP address
- Applied to all API routes
- Returns `429 Too Many Requests` when limit is exceeded
- Automatic cleanup of expired records

**Note for Production:** The current implementation uses in-memory storage which:
- Will not persist across server restarts
- Won't be shared across multiple instances in distributed deployments
- For high-traffic production environments, consider using Redis or similar for distributed rate limiting

### Environment Variables

Never commit sensitive keys to version control. Always use environment variables:
- `.env.example` - Template file (safe to commit)
- `.env` - Actual configuration (never commit)

## 📈 SEO Optimization

This project includes comprehensive SEO optimization:

### What's Included

✅ **Meta Tags** - Comprehensive title, description, and keywords
✅ **Open Graph Tags** - Perfect social media sharing previews
✅ **Twitter Card** - Optimized Twitter/X sharing
✅ **JSON-LD Structured Data** - Enhanced search engine understanding
✅ **Robots.txt** - Proper crawling instructions
✅ **Sitemap.xml** - Automated sitemap generation
✅ **Canonical URLs** - Prevent duplicate content issues
✅ **Semantic HTML** - Proper heading hierarchy and structure

### Improving SEO Rankings

To rank higher on search engines:

1. **Add Custom Domain**
   - Purchase a memorable domain name
   - Set up custom domain in your hosting platform
   - Update all URLs in `app/layout.tsx` and `app/sitemap.ts`

2. **Add High-Quality Content**
   - Create blog posts about brand naming tips
   - Add a resources page with guides
   - Write case studies of successful brand names

3. **Get Backlinks**
   - Submit to web directories (Product Hunt, BetaList, etc.)
   - Write guest posts on relevant blogs
   - Engage in relevant communities (Reddit, Indie Hackers)

4. **Optimize Performance**
   - The app is already optimized, but you can:
   - Add a CDN for static assets
   - Enable compression in your hosting
   - Monitor Core Web Vitals

5. **Social Media Presence**
   - Share on Twitter, LinkedIn, Reddit
   - Create demo videos for YouTube
   - Engage with potential users

6. **Submit to Search Engines**
   - [Google Search Console](https://search.google.com/search-console)
   - [Bing Webmaster Tools](https://www.bing.com/webmasters)
   - Submit sitemap: `https://yourdomain.com/sitemap.xml`

7. **Update Verification Codes**
   - Add Google Search Console verification in `app/layout.tsx` (uncomment and add your code)
   - Add other search engine verifications as needed

8. **Create OG Image** (Required for social sharing)
   - Design a 1200x630px image showcasing your app
   - Save as `public/og-image.png`
   - Include app name and key features
   - Current code references this image but it needs to be created

## 📁 Project Structure

```
├── app/
│   ├── api/                  # API routes
│   │   ├── check-domain/    # Domain availability API
│   │   ├── check-social/    # Social media username API
│   │   └── generate-names/  # AI name generation API
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Home page
│   ├── robots.ts            # Robots.txt configuration
│   ├── sitemap.ts           # Sitemap generation
│   └── globals.css          # Global styles
├── components/
│   ├── NameChecker.tsx      # Main application component
│   └── ui/                  # shadcn/ui components
├── lib/
│   └── utils.ts             # Utility functions
├── middleware.ts            # Rate limiting middleware
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose configuration
├── .env.example             # Environment variables template
└── ...config files
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🔮 Future Improvements

Potential features to add:
- [ ] Historical price tracking for domains
- [ ] Bulk checking (CSV upload)
- [ ] Email notifications for domain availability changes
- [ ] More AI models for name generation
- [ ] Trademark checking
- [ ] Export results to PDF/CSV
- [ ] User accounts and saved searches
- [ ] Domain registration integration

## 🐛 Troubleshooting

### Docker Issues

**Container won't start:**
```bash
# Check logs
docker-compose logs

# Rebuild the image
docker-compose build --no-cache
docker-compose up -d
```

**Port already in use:**
```bash
# Change PORT in .env file or stop the conflicting service
lsof -ti:3000 | xargs kill -9  # macOS/Linux
```

### Development Issues

**Module not found errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**API not working:**
- Check if `GROQ_API_KEY` is set correctly in `.env`
- Verify your Groq API key is valid at [console.groq.com](https://console.groq.com/)
- Check API rate limits

## 💬 Support

For issues, questions, or suggestions:
- Open an issue on [GitHub](https://github.com/1-kabir/name-checker/issues)
- Visit [Kabir Studios](https://www.kabirstudios.com/)

---

Made with ❤ by [Kabir](https://www.kabirstudios.com/)

