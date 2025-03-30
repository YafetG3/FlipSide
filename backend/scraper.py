from newspaper import Article
from bs4 import BeautifulSoup
import requests
from typing import Dict, Optional

def extract_article_content(url: str) -> Dict[str, str]:
    """
    Extract article content using newspaper3k, falling back to BeautifulSoup if needed.
    Returns a dictionary containing the article title and content.
    """
    try:
        article = Article(url)
        article.download()
        article.parse()
        
        return {
            "title": article.title,
            "content": article.text,
            "source": url
        }
    except Exception as e:
        print(f"Newspaper3k failed: {str(e)}")
        return fallback_scraper(url)

def fallback_scraper(url: str) -> Dict[str, str]:
    """
    Fallback scraper using BeautifulSoup for sites where newspaper3k fails.
    """
    try:
        response = requests.get(url)
        soup = BeautifulSoup(response.text, 'html.parser')
        
        title = soup.find('title')
        title_text = title.text if title else "Untitled"
        
        content_tags = soup.find_all(['article', 'main', 'div'], class_=['content', 'article', 'post'])
        
        if not content_tags:

            content_tags = soup.find_all('p')
        
        content = '\n'.join([tag.get_text().strip() for tag in content_tags])
        
        return {
            "title": title_text,
            "content": content,
            "source": url
        }
    except Exception as e:
        raise Exception(f"Failed to scrape article: {str(e)}") 