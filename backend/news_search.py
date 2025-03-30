import os
import requests
from typing import Dict, Optional
from datetime import datetime, timedelta
from dotenv import load_dotenv

# Load .env file
load_dotenv()

class NewsAPI:
    def __init__(self):
        self.api_key = os.getenv("NEWS_API_KEY")
        if not self.api_key:
            raise ValueError("NEWS_API_KEY is not set in the environment.")
        self.base_url = "https://newsapi.org/v2"

    def search_articles(self, query: str, bias: str, days: int = 7) -> Optional[Dict]:
        """
        Search for articles matching the query from sources with the specified bias.
        """
        try:
            # Calculate date range
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days)

            # Format dates for API
            from_date = start_date.strftime("%Y-%m-%d")
            to_date = end_date.strftime("%Y-%m-%d")

            # Build query
            params = {
                "q": query,
                "from": from_date,
                "to": to_date,
                "language": "en",
                "sortBy": "relevancy",
                "apiKey": self.api_key
            }

            # Make API request
            response = requests.get(f"{self.base_url}/everything", params=params)
            response.raise_for_status()

            data = response.json()

            if data["status"] == "ok" and data["articles"]:
                # Return the first article that matches our criteria
                for article in data["articles"]:
                    if self._matches_bias(article["source"]["name"], bias):
                        return {
                            "title": article["title"],
                            "content": article["description"],
                            "url": article["url"],
                            "source": article["source"]["name"],
                            "bias": bias
                        }

            return None

        except Exception as e:
            print(f"Error searching articles: {str(e)}")
            return None

    def _matches_bias(self, source_name: str, target_bias: str) -> bool:
        """
        Check if a news source matches the target bias.
        This is a simplified version - in production, you'd want a more comprehensive mapping.
        """
        source_name = source_name.lower()

        if target_bias == "left":
            return any(name in source_name for name in ["cnn", "msnbc", "huffpost", "vox"])
        elif target_bias == "right":
            return any(name in source_name for name in ["fox", "breitbart", "daily wire", "newsmax"])
        else:  # center
            return any(name in source_name for name in ["reuters", "ap", "bloomberg", "wsj"])


# For development/testing, we can use a stub version
def get_stub_counter_article(topic: str, bias: str) -> Dict:
    """
    Return a stub counter article for development/testing.
    """
    return {
        "title": f"Counter Article About {topic}",
        "content": f"This is a sample counter article about {topic} from a {bias}-leaning source.",
        "url": "https://example.com/counter-article",
        "source": "Example News",
        "bias": bias
    }
