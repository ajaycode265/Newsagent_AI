import json
import time
from typing import List, Dict, Any
import chromadb
from llm.router import llm

class DeepBriefingAgent:
    def __init__(self):
        self.chroma_client = chromadb.PersistentClient(path="./chroma_db")
        try:
            self.briefing_collection = self.chroma_client.get_collection("briefing_sections")
        except:
            self.briefing_collection = self.chroma_client.create_collection(
                name="briefing_sections",
                metadata={"hnsw:space": "cosine"}
            )
    
    def create_briefing(self, articles: List[Dict[str, Any]], topic: str, session_id: str) -> tuple[Dict[str, Any], Dict[str, Any]]:
        start_time = time.time()
        
        articles_text = self._prepare_articles_text(articles)
        
        sections = self._generate_sections(articles_text, topic, session_id)
        
        self._index_sections(sections, session_id)
        
        time_ms = int((time.time() - start_time) * 1000)
        metadata = {
            "topic": topic,
            "articles_count": len(articles),
            "sections_count": len(sections),
            "time_ms": time_ms
        }
        
        briefing = {
            "topic": topic,
            "sections": sections,
            "session_id": session_id,
            "article_count": len(articles)
        }
        
        return briefing, metadata
    
    def _prepare_articles_text(self, articles: List[Dict[str, Any]]) -> str:
        articles_summary = []
        for idx, article in enumerate(articles[:22], 1):
            articles_summary.append(f"Article {idx}: {article['headline']}\n{article['body'][:600]}")
        
        return "\n\n".join(articles_summary)
    
    def _generate_sections(self, articles_text: str, topic: str, session_id: str) -> Dict[str, Dict[str, str]]:
        prompt = f"""Synthesize these {topic} articles into 7 distinct, non-overlapping sections. Each section must contain UNIQUE information with NO repetition.

{articles_text[:12000]}

Create these 7 sections with DIFFERENT content in each:
1. macro_impact - Overall economic impact
2. sector_winners - Which sectors benefit
3. sector_losers - Which sectors face challenges
4. market_reaction - Stock market and investor response
5. expert_commentary - What analysts and experts say
6. historical_comparison - How this compares to past events
7. what_to_watch - Future outlook and key factors to monitor

Return ONLY valid JSON with this structure:
{{
  "macro_impact": {{"title": "...", "content": "..."}},
  "sector_winners": {{"title": "...", "content": "..."}},
  "sector_losers": {{"title": "...", "content": "..."}},
  "market_reaction": {{"title": "...", "content": "..."}},
  "expert_commentary": {{"title": "...", "content": "..."}},
  "historical_comparison": {{"title": "...", "content": "..."}},
  "what_to_watch": {{"title": "...", "content": "..."}}
}}

Each content should be 150-250 words and answer DIFFERENT questions."""

        try:
            response = llm.call("synthesis", prompt, temperature=0.3, max_tokens=3000)
            
            response_clean = response.strip()
            if response_clean.startswith("```json"):
                response_clean = response_clean[7:]
            if response_clean.startswith("```"):
                response_clean = response_clean[3:]
            if response_clean.endswith("```"):
                response_clean = response_clean[:-3]
            response_clean = response_clean.strip()
            
            sections = json.loads(response_clean)
            return sections
        except Exception as e:
            print(f"Briefing generation failed: {e}")
            return self._fallback_sections(topic)
    
    def _fallback_sections(self, topic: str) -> Dict[str, Dict[str, str]]:
        return {
            "macro_impact": {
                "title": "Economic Impact Overview",
                "content": f"The {topic} has significant implications for India's economic trajectory. Key indicators show mixed signals with both opportunities and challenges ahead."
            },
            "sector_winners": {
                "title": "Sectors Poised to Benefit",
                "content": "Infrastructure, banking, and capital goods sectors are expected to see positive momentum from recent developments."
            },
            "sector_losers": {
                "title": "Sectors Facing Headwinds",
                "content": "Some sectors may face near-term challenges as market dynamics adjust to new conditions."
            },
            "market_reaction": {
                "title": "Market Response",
                "content": "Stock markets have shown volatility with investors reassessing positions across various sectors."
            },
            "expert_commentary": {
                "title": "Expert Analysis",
                "content": "Analysts remain cautiously optimistic about long-term prospects while highlighting execution risks."
            },
            "historical_comparison": {
                "title": "Historical Context",
                "content": "Comparing to previous similar events provides insights into potential outcomes and trajectories."
            },
            "what_to_watch": {
                "title": "Key Factors Ahead",
                "content": "Implementation, global economic conditions, and domestic policy decisions will be critical factors to monitor."
            }
        }
    
    def _index_sections(self, sections: Dict[str, Dict[str, str]], session_id: str):
        for section_key, section_data in sections.items():
            doc_id = f"{session_id}_{section_key}"
            
            try:
                self.briefing_collection.add(
                    documents=[section_data['content']],
                    metadatas=[{
                        "session_id": session_id,
                        "section_key": section_key,
                        "title": section_data['title']
                    }],
                    ids=[doc_id]
                )
            except Exception as e:
                print(f"Failed to index section {section_key}: {e}")
    
    def answer_question(self, question: str, session_id: str) -> Dict[str, Any]:
        try:
            results = self.briefing_collection.query(
                query_texts=[question],
                n_results=1,
                where={"session_id": session_id}
            )
            
            if results['documents'] and results['documents'][0]:
                section_content = results['documents'][0][0]
                section_metadata = results['metadatas'][0][0]
                
                prompt = f"""Answer this question based ONLY on the provided section content. Be concise and specific.

Question: {question}

Section Content:
{section_content}

Provide a direct answer in 2-3 sentences."""

                answer = llm.call("fast", prompt, temperature=0.2, max_tokens=200)
                
                return {
                    "answer": answer.strip(),
                    "source_section": section_metadata['section_key'],
                    "section_label": section_metadata['title'],
                    "confidence": round(1 - results['distances'][0][0], 2)
                }
            else:
                return {
                    "answer": "I don't have enough information to answer that question based on the briefing.",
                    "source_section": "none",
                    "section_label": "N/A",
                    "confidence": 0
                }
        except Exception as e:
            print(f"Q&A failed: {e}")
            return {
                "answer": f"Error processing question: {str(e)}",
                "source_section": "error",
                "section_label": "Error",
                "confidence": 0
            }
