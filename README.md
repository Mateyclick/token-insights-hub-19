# TokenFormatAnalyzer

A powerful fullstack application for analyzing file formats and comparing token usage across format conversions. Upload files and instantly see how different formats affect token counts, processing time, and estimated costs.

![TokenFormatAnalyzer](https://img.shields.io/badge/Version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 🚀 Features

- **📁 Multi-Format Support**: Upload JSON, YAML, TOML, XML, and plain text files
- **🔍 Auto-Detection**: Automatically detects file format
- **🔄 Format Conversion**: Converts content to all supported formats
- **📊 Token Analysis**: Calculates token counts for each format
- **💰 Cost Estimation**: Estimates API costs based on token usage
- **⚡ Performance Metrics**: Tracks processing time for each conversion
- **📈 Visual Comparison**: Beautiful charts comparing token usage
- **🎨 Modern UI**: Clean, responsive dashboard design
- **🌙 Dark Mode**: Automatic dark mode support

## 🛠️ Technologies Used

### Frontend
- **React 18** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **TailwindCSS** - Utility-first styling
- **shadcn/ui** - Beautiful component library
- **Recharts** - Data visualization
- **Lucide Icons** - Modern icon set

### Libraries
- **js-yaml** - YAML parsing and generation
- **@iarna/toml** - TOML parsing and generation
- **xml2js** - XML parsing

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm

### Quick Start

```bash
# Clone the repository
git clone <YOUR_GIT_URL>

# Navigate to project directory
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:8080`

## 🎯 Usage

1. **Upload File**: Drag and drop or click to select a file (JSON, YAML, TOML, XML, or TXT)
2. **Analyze**: Click the "Analyze File" button
3. **View Results**: See detailed comparison of:
   - Token counts per format
   - Processing time
   - Estimated costs
   - Visual chart comparison

## 📊 How It Works

1. **Format Detection**: The app automatically detects your file format
2. **Parsing**: Content is parsed into a structured data object
3. **Conversion**: Data is converted to:
   - JSON (Minified)
   - JSON (Pretty)
   - YAML
   - TOML
4. **Token Estimation**: Calculates approximate token count (~4 characters per token)
5. **Cost Calculation**: Estimates API costs based on token usage

## 🎨 Design System

The application uses a professional blue and green color scheme with semantic tokens:

- **Primary**: Blue (`hsl(210 100% 45%)`)
- **Secondary**: Green (`hsl(160 60% 45%)`)
- **Background**: Light gray (`hsl(210 40% 98%)`)
- **Dark Mode**: Full dark theme support

## 📝 Project Structure

```
token-format-analyzer/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   ├── FileUpload.tsx   # File upload component
│   │   ├── ResultsTable.tsx # Results table
│   │   └── ResultsChart.tsx # Token comparison chart
│   ├── lib/
│   │   ├── formatUtils.ts   # Format conversion utilities
│   │   └── utils.ts         # General utilities
│   ├── pages/
│   │   └── Index.tsx        # Main application page
│   ├── App.tsx              # Root component
│   ├── index.css            # Design system tokens
│   └── main.tsx             # Application entry point
├── public/                  # Static assets
├── README.md                # This file
├── package.json             # Dependencies
├── vite.config.ts           # Vite configuration
├── tailwind.config.ts       # Tailwind configuration
└── tsconfig.json            # TypeScript configuration
```

## 🔧 Configuration

The application uses environment variables for configuration. Create a `.env` file:

```env
# No environment variables required for basic functionality
# Add API keys here if integrating with real AI APIs
```

## 🚀 Deployment

### Build for Production

```bash
npm run build
```

The optimized production build will be in the `dist/` directory.

### Deploy with Lovable

Simply open [Lovable](https://lovable.dev/projects/8fdf305e-5ec8-49bb-bb61-5cdd986ea59d) and click on Share -> Publish.

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

### Deploy to Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

## 🧪 Token Estimation

Current implementation uses a simple character-based estimation (~4 characters per token). This approximation works well for most text formats.

For production use with real AI APIs:
1. Integrate with OpenAI's `tiktoken` library
2. Use model-specific tokenizers
3. Update the `estimateTokens()` function in `src/lib/formatUtils.ts`

## 💡 Future Enhancements

- [ ] Real AI API integration (OpenAI, Anthropic, etc.)
- [ ] Support for more formats (CSV, Protobuf, MessagePack)
- [ ] Batch file analysis
- [ ] Export results to CSV/PDF
- [ ] Historical analysis tracking
- [ ] Cost optimization recommendations
- [ ] Custom token pricing configuration

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Lovable](https://lovable.dev)
- UI components from [shadcn/ui](https://ui.shadcn.com)
- Icons from [Lucide](https://lucide.dev)

---

Made with ❤️ using Lovable
