import json
import os
import time
from typing import List, Dict, Any
import chromadb
import hashlib

class NewsIngestionAgent:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        try:
            self.collection = self.chroma_client.get_collection("articles")
        except:
            self.collection = self.chroma_client.create_collection(
                name="articles",
                metadata={"hnsw:space": "cosine"}
            )
    
    def fetch_articles(self, topic: str, use_tavily: bool = True) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        start_time = time.time()
        articles = []
        metadata = {"source": "mock", "fallback": False}
        
        if use_tavily and os.getenv("TAVILY_API_KEY"):
            try:
                articles = self._fetch_from_tavily(topic)
                metadata["source"] = "tavily"
            except Exception as e:
                print(f"Tavily fetch failed: {e}, falling back to mock data")
                metadata["fallback"] = True
                articles = self._fetch_from_mock(topic)
        else:
            articles = self._fetch_from_mock(topic)
        
        deduplicated = self._deduplicate(articles)
        
        time_ms = int((time.time() - start_time) * 1000)
        metadata.update({
            "original_count": len(articles),
            "deduplicated_count": len(deduplicated),
            "duplicates_removed": len(articles) - len(deduplicated),
            "time_ms": time_ms
        })
        
        return deduplicated, metadata
    
    def _fetch_from_tavily(self, topic: str) -> List[Dict[str, Any]]:
        import requests
        
        api_key = os.getenv("TAVILY_API_KEY")
        url = "https://api.tavily.com/search"
        
        payload = {
            "api_key": api_key,
            "query": f"{topic} India business news",
            "search_depth": "advanced",
            "max_results": 15
        }
        
        response = requests.post(url, json=payload, timeout=10)
        response.raise_for_status()
        
        results = response.json().get("results", [])
        
        articles = []
        for idx, result in enumerate(results):
            articles.append({
                "id": f"tavily_{hashlib.md5(result['url'].encode()).hexdigest()[:8]}",
                "headline": result.get("title", ""),
                "body": result.get("content", ""),
                "url": result.get("url", ""),
                "source": result.get("source", "Unknown"),
                "publish_time": result.get("published_date", ""),
                "tags": []
            })
        
        return articles
    
    def _fetch_from_mock(self, topic: str) -> List[Dict[str, Any]]:
        topic_lower = topic.lower()
        
        if "budget" in topic_lower or "union budget" in topic_lower:
            file_path = "data/budget_articles.json"
        elif "bankruptcy" in topic_lower or "videocon" in topic_lower or "nclt" in topic_lower:
            file_path = "data/bankruptcy_article.json"
            with open(file_path, 'r', encoding='utf-8') as f:
                article = json.load(f)
                return [article]
        else:
            file_path = "data/feed_articles.json"
        
        with open(file_path, 'r', encoding='utf-8') as f:
            articles = json.load(f)
        
        return articles
    
    def _deduplicate(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        if not articles:
            return []
        
        unique_articles = []
        seen_ids = set()
        
        for article in articles:
            article_id = article.get("id", "")
            headline = article.get("headline", "")
            body = article.get("body", "")
            
            if not article_id or not headline:
                continue
            
            if article_id in seen_ids:
                continue
            seen_ids.add(article_id)
            
            text_for_embedding = f"{headline} {body[:500]}"
            
            try:
                # Check if this exact article ID already exists in the DB
                existing = self.collection.get(ids=[article_id])
                if existing and existing.get('ids'):
                    # Already indexed before — include it, it's not a cross-duplicate
                    unique_articles.append(article)
                    continue
                
                # New article — check similarity against other articles
                count = self.collection.count()
                if count > 0:
                    results = self.collection.query(
                        query_texts=[text_for_embedding],
                        n_results=1
                    )
                    if results['distances'] and results['distances'][0]:
                        similarity = 1 - results['distances'][0][0]
                        if similarity > 0.92:
                            continue
                
                self.collection.add(
                    documents=[text_for_embedding],
                    metadatas=[{"article_id": article_id, "headline": headline}],
                    ids=[article_id]
                )
            except Exception as e:
                print(f"ChromaDB error for {article_id}: {e}")
            
            unique_articles.append(article)
        
        return unique_articles
    
    def normalize_articles(self, articles: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        normalized = []
        
        for article in articles:
            normalized.append({
                "id": article.get("id", ""),
                "headline": article.get("headline", ""),
                "body": article.get("body", ""),
                "url": article.get("url", ""),
                "source": article.get("source", "Unknown"),
                "publish_time": article.get("publish_time", ""),
                "tags": article.get("tags", []),
                "entities": {},
                "sentiment": {},
                "importance_score": 0,
                "persona_relevance": {}
            })
        
        return normalized
