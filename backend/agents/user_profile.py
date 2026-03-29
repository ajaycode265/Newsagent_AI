import time
from typing import List, Dict, Any

class UserProfileAgent:
    PERSONAS = {
        "cfo": {
            "name": "CFO",
            "description": "Chief Financial Officer - macro/policy focus, technical tone",
            "boost_keywords": [
                "gdp", "fiscal", "deficit", "policy", "rbi", "monetary", "inflation",
                "fii", "foreign investment", "market", "stock", "sensex", "nifty",
                "corporate", "earnings", "revenue", "profit", "quarterly results",
                "budget", "tax", "regulation", "compliance", "rating", "bond"
            ],
            "suppress_keywords": [
                "sip", "beginner", "guide", "how to", "simple", "easy",
                "rs 500", "small investment", "personal finance basics"
            ],
            "preferred_depth": "detailed",
            "preferred_format": "technical",
            "headline_tone": "professional"
        },
        "first_gen_investor": {
            "name": "First-Gen Investor",
            "description": "First-time investor - SIP/basics focus, accessible tone",
            "boost_keywords": [
                "sip", "mutual fund", "investment guide", "beginner", "how to",
                "personal finance", "savings", "tax saving", "ppf", "fd",
                "emi", "home loan", "credit score", "simple", "easy",
                "rs 500", "small investment", "retirement planning"
            ],
            "suppress_keywords": [
                "fii", "foreign institutional", "derivative", "futures",
                "options", "hedge", "arbitrage", "complex", "advanced"
            ],
            "preferred_depth": "simple",
            "preferred_format": "accessible",
            "headline_tone": "friendly"
        }
    }
    
    def get_profile(self, persona: str) -> Dict[str, Any]:
        return self.PERSONAS.get(persona, self.PERSONAS["cfo"])
    
    def score_articles_for_persona(self, articles: List[Dict[str, Any]], persona: str) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        start_time = time.time()
        
        profile = self.get_profile(persona)
        
        for article in articles:
            text = f"{article['headline']} {article['body']}".lower()
            
            boost_score = sum(
                5 for keyword in profile['boost_keywords']
                if keyword.lower() in text
            )
            
            suppress_score = sum(
                3 for keyword in profile['suppress_keywords']
                if keyword.lower() in text
            )
            
            persona_relevance = max(0, boost_score - suppress_score)
            
            article['persona_relevance'][persona] = persona_relevance
        
        time_ms = int((time.time() - start_time) * 1000)
        metadata = {
            "persona": persona,
            "articles_scored": len(articles),
            "time_ms": time_ms
        }
        
        return articles, metadata
