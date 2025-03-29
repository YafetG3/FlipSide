# FlipSide

FlipSide is a web application that helps users break out of ideological echo chambers by using AI to analyze and contrast political news perspectives. When a user pastes a URL of a news article, the application analyzes the content and presents three things:

1. The original article content
2. An AI-generated summary with a pros and cons breakdown
3. A counter-article from a news source with an opposing political bias

## Features

- Article content extraction using newspaper3k and BeautifulSoup
- AI-powered analysis using GPT-4
- Political bias detection and counter-article search
- Clean, responsive UI built with React and Tailwind CSS
- FastAPI backend with async support

## Prerequisites

- Python 3.8+
- Node.js 16+
- OpenAI API key
- NewsAPI key (optional, for counter-article search)

## Setup

### Backend

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_news_api_key  # Optional
```

4. Start the backend server:
```bash
uvicorn main:app --reload
```

### Frontend

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

## Usage

1. Open your browser and navigate to `http://localhost:5173`
2. Paste a news article URL into the input field
3. Click "See the Other Side" to analyze the article
4. View the original article, AI analysis, and counter-article in the three-panel layout

## Project Structure

```
flip-side-project/
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── index.jsx
│   └── tailwind.config.js
│
├── backend/             # FastAPI backend
│   ├── main.py          # App entry point
│   ├── routes.py        # API endpoints
│   ├── scraper.py       # Article extraction logic
│   ├── ai.py            # GPT summarizer & pro/con generator
│   ├── news_search.py   # Counter-article finder
│   └── bias_utils.py    # Source bias mapping logic
│
├── bias_sources.json    # Known political leanings of news domains
├── LICENSE              # MIT License
└── README.md
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.