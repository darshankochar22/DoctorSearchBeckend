from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import requests
import json
from urllib.parse import quote
from langchain_community.tools.tavily_search import TavilySearchResults
import os
from pydantic import BaseModel
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

FRONTEND_URL = "https://prod-scout.vercel.app/"
DIFFBOT_API_KEY = os.getenv("DIFFBOT_API_KEY")
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CLIENT_PUBLIC_DIR = os.path.join(BASE_DIR, 'client', 'public')

os.makedirs(CLIENT_PUBLIC_DIR, exist_ok=True)

class SearchQuery(BaseModel):
    query: str

def save_json_file(data: dict, filename: str) -> None:
    """Save JSON data to file with proper error handling"""
    filepath = os.path.join(CLIENT_PUBLIC_DIR, filename)
    try:
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
        print(f"Successfully saved file to: {filepath}")
    except Exception as e:
        print(f"Error saving file: {e}")  
        raise HTTPException(status_code=500, detail=f"Failed to save JSON file: {str(e)}")

def clean_image_url(url: str) -> str:
    """Validate and clean image URLs"""
    if 'akam' in url or 'pixel' in url:
        return None
    return url

@app.post("/api/search")
async def search_products(search_query: SearchQuery):
    try:
        # Initialize Tavily search tool with medical domain filtering
        search_tool = TavilySearchResults(
            tavily_api_key=TAVILY_API_KEY,
            max_results=3,
            search_depth="advanced",
            include_answer=False,
            include_raw_content=False,
            include_images=False,
            include_domains=[
                "zocdoc.com", "practo.com", "placidway.com", "healthgrades.com",
                "vitals.com", "ratemds.com", "docplanner.com", "webmd.com",
                "mayoclinic.org", "healthcare.gov", "medlineplus.gov"
            ],
            exclude_domains=[
                "reddit.com", "quora.com", "facebook.com", "twitter.com",
                "linkedin.com", "instagram.com", "youtube.com", "pinterest.com",
                "wikipedia.org", "blogspot.com", "medium.com", "wordpress.com"
            ]
        )
        
        # Execute search
        search_results = search_tool.invoke({"query": search_query.query})
        urls = [result["url"] for result in search_results if "url" in result]
        
        json_results = []

        for url in urls:
            encoded_url = quote(url, safe='')
            endpoint = f'https://api.diffbot.com/v3/product?token={DIFFBOT_API_KEY}&url={encoded_url}'
            response = requests.get(endpoint)
            
            if not response.ok:
                continue
                
            json_data = response.json()
            
            # Clean up image URLs
            if 'objects' in json_data:
                for obj in json_data['objects']:
                    if 'images' in obj:
                        obj['images'] = [
                            img for img in obj['images']
                            if img.get('url') and clean_image_url(img['url'])
                        ]
                        for img in obj['images']:
                            img['url'] = clean_image_url(img['url'])
                            
            if 'objects' in json_data and json_data['objects']:
                json_results.append(json_data)
                
        return {"status": "success", "results": json_results}
        
    except Exception as e:
        print(f"Error in search_products: {e}")
        raise HTTPException(status_code=500, detail=str(e))