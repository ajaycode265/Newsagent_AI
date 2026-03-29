import json
import time
from typing import List, Dict, Any
from datetime import datetime
from llm.router import llm

class ProcessingAgent:
    def process_articles(self, articles: List[Dict[str, Any]]) -> tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        trace_steps = []
        
        articles = self._extract_entities(articles, trace_steps)
        articles = self._detect_sentiment(articles, trace_steps)
        articles = self._score_importance(articles, trace_steps)
        
        return articles, trace_steps
    
    def _extract_entities(self, articles: List[Dict[str, Any]], trace_steps: List[Dict]) -> List[Dict[str, Any]]:
        start_time = time.time()
        
        for article in articles:
            prompt = f"""Extract entities from this news article. Return ONLY valid JSON.

Article: {article['headline']}
{article['body'][:800]}

Return JSON with this exact structure:
{{
  "companies": ["company1", "company2"],
  "people": ["person1", "person2"],
  "sectors": ["sector1", "sector2"],
  "policies": ["policy1"],
  "economic_indicators": ["indicator1"]
}}"""

            try:
                response = llm.call("extraction", prompt, temperature=0.1, max_tokens=500)
                
                response_clean = response.strip()
                if response_clean.startswith("```json"):
                    response_clean = response_clean[7:]
                if response_clean.startswith("```"):
                    response_clean = response_clean[3:]
                if response_clean.endswith("```"):
                    response_clean = response_clean[:-3]
                response_clean = response_clean.strip()
                
                entities = json.loads(response_clean)
                article['entities'] = entities
            except Exception as e:
                print(f"Entity extraction failed for {article['id']}: {e}")
                article['entities'] = self._fallback_entity_extraction(article)
        
        time_ms = int((time.time() - start_time) * 1000)
        trace_steps.append({
            "step": "Entity Extraction",
            "agent": "ProcessingAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"articles_processed": len(articles)}
        })
        
        return articles
    
    def _fallback_entity_extraction(self, article: Dict[str, Any]) -> Dict[str, List[str]]:
        text = f"{article['headline']} {article['body']}".lower()
        
        companies = []
        company_keywords = ['ltd', 'limited', 'inc', 'corp', 'industries', 'bank', 'motors', 'group']
        words = text.split()
        for i, word in enumerate(words):
            if any(kw in word for kw in company_keywords):
                if i > 0:
                    companies.append(words[i-1].title())
        
        sectors = []
        sector_map = {
            'bank': 'Banking', 'it': 'IT', 'tech': 'Technology', 'auto': 'Automotive',
            'pharma': 'Pharmaceuticals', 'steel': 'Steel', 'cement': 'Cement',
            'energy': 'Energy', 'retail': 'Retail', 'telecom': 'Telecom'
        }
        for keyword, sector in sector_map.items():
            if keyword in text:
                sectors.append(sector)
        
        return {
            "companies": companies[:5],
            "people": [],
            "sectors": list(set(sectors)),
            "policies": [],
            "economic_indicators": []
        }
    
    def _detect_sentiment(self, articles: List[Dict[str, Any]], trace_steps: List[Dict]) -> List[Dict[str, Any]]:
        start_time = time.time()
        
        batch_size = 5
        for i in range(0, len(articles), batch_size):
            batch = articles[i:i+batch_size]
            
            articles_text = "\n\n".join([
                f"Article {idx}: {art['headline']}\n{art['body'][:300]}"
                for idx, art in enumerate(batch)
            ])
            
            prompt = f"""Analyze sentiment for these news articles. Return ONLY valid JSON array.

{articles_text}

Return JSON array with this exact structure for each article:
[
  {{
    "overall": "positive|negative|neutral",
    "market_impact": "high|medium|low",
    "affected_sectors": ["sector1", "sector2"]
  }}
]"""

            try:
                response = llm.call("fast", prompt, temperature=0.1, max_tokens=800)
                
                response_clean = response.strip()
                if response_clean.startswith("```json"):
                    response_clean = response_clean[7:]
                if response_clean.startswith("```"):
                    response_clean = response_clean[3:]
                if response_clean.endswith("```"):
                    response_clean = response_clean[:-3]
                response_clean = response_clean.strip()
                
                sentiments = json.loads(response_clean)
                
                for idx, article in enumerate(batch):
                    if idx < len(sentiments):
                        article['sentiment'] = sentiments[idx]
                    else:
                        article['sentiment'] = self._fallback_sentiment(article)
            except Exception as e:
                print(f"Sentiment detection failed for batch: {e}")
                for article in batch:
                    article['sentiment'] = self._fallback_sentiment(article)
        
        time_ms = int((time.time() - start_time) * 1000)
        trace_steps.append({
            "step": "Sentiment Detection",
            "agent": "ProcessingAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"articles_processed": len(articles)}
        })
        
        return articles
    
    def _fallback_sentiment(self, article: Dict[str, Any]) -> Dict[str, Any]:
        text = f"{article['headline']} {article['body']}".lower()
        
        positive_words = ['growth', 'surge', 'gain', 'profit', 'rise', 'jump', 'boost', 'strong']
        negative_words = ['fall', 'decline', 'loss', 'drop', 'weak', 'concern', 'crisis', 'outflow']
        
        pos_count = sum(1 for word in positive_words if word in text)
        neg_count = sum(1 for word in negative_words if word in text)
        
        if pos_count > neg_count:
            overall = "positive"
        elif neg_count > pos_count:
            overall = "negative"
        else:
            overall = "neutral"
        
        return {
            "overall": overall,
            "market_impact": "medium",
            "affected_sectors": article.get('entities', {}).get('sectors', [])
        }
    
    def _score_importance(self, articles: List[Dict[str, Any]], trace_steps: List[Dict]) -> List[Dict[str, Any]]:
        start_time = time.time()
        
        for article in articles:
            try:
                publish_time = datetime.fromisoformat(article['publish_time'].replace('Z', '+00:00'))
                hours_old = (datetime.now().astimezone() - publish_time).total_seconds() / 3600
            except:
                hours_old = 24
            
            recency = max(0, 100 - (hours_old / 48) * 100)
            
            entities = article.get('entities', {})
            entity_count = (
                len(entities.get('companies', [])) +
                len(entities.get('people', [])) +
                len(entities.get('sectors', [])) +
                len(entities.get('policies', [])) +
                len(entities.get('economic_indicators', []))
            )
            entity_score = min(100, entity_count * 10)
            
            sentiment = article.get('sentiment', {})
            impact_map = {"high": 100, "medium": 60, "low": 20}
            impact_score = impact_map.get(sentiment.get('market_impact', 'medium'), 60)
            
            importance_score = 0.4 * recency + 0.3 * entity_score + 0.3 * impact_score
            article['importance_score'] = round(importance_score, 2)
        
        time_ms = int((time.time() - start_time) * 1000)
        trace_steps.append({
            "step": "Importance Scoring",
            "agent": "ProcessingAgent",
            "status": "completed",
            "time_ms": time_ms,
            "metadata": {"articles_processed": len(articles)}
        })
        
        return articles
