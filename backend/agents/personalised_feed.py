import time
from typing import List, Dict, Any
from llm.router import llm

class PersonalisedFeedAgent:
    def create_personalised_feed(self, articles: List[Dict[str, Any]], persona: str, top_n: int = 12) -> tuple[List[Dict[str, Any]], Dict[str, Any]]:
        start_time = time.time()
        
        for article in articles:
            importance = article.get('importance_score', 0)
            persona_rel = article.get('persona_relevance', {}).get(persona, 0)
            
            final_score = 0.4 * importance + 0.6 * persona_rel
            article['final_score'] = round(final_score, 2)
        
        sorted_articles = sorted(articles, key=lambda x: x.get('final_score', 0), reverse=True)
        top_articles = sorted_articles[:top_n]
        
        top_articles = self._rewrite_headlines(top_articles, persona)
        
        time_ms = int((time.time() - start_time) * 1000)
        metadata = {
            "persona": persona,
            "total_articles": len(articles),
            "selected_articles": len(top_articles),
            "time_ms": time_ms
        }
        
        return top_articles, metadata
    
    def _rewrite_headlines(self, articles: List[Dict[str, Any]], persona: str) -> List[Dict[str, Any]]:
        from agents.user_profile import UserProfileAgent
        
        profile_agent = UserProfileAgent()
        profile = profile_agent.get_profile(persona)
        
        for article in articles:
            article['original_headline'] = article['headline']
            
            if persona == "cfo":
                prompt = f"""Rewrite this headline for a CFO audience. Keep it professional and technical. Add specific data points if mentioned in the body.

Original: {article['headline']}
Body excerpt: {article['body'][:200]}

Return ONLY the rewritten headline, nothing else."""
            else:
                prompt = f"""Rewrite this headline for a first-time investor. Make it simple, friendly, and explain "what this means for you". Use plain language, avoid jargon.

Original: {article['headline']}
Body excerpt: {article['body'][:200]}

Return ONLY the rewritten headline, nothing else."""
            
            try:
                rewritten = llm.call("fast", prompt, temperature=0.4, max_tokens=100)
                rewritten = rewritten.strip().strip('"').strip("'")
                
                if rewritten and len(rewritten) > 10 and len(rewritten) < 200:
                    article['headline'] = rewritten
            except Exception as e:
                print(f"Headline rewrite failed for {article['id']}: {e}")
        
        return articles
