import json
import time
from typing import Dict, Any, AsyncGenerator
from models.state import NewsState, add_trace_step, add_error
from agents import (
    NewsIngestionAgent,
    ProcessingAgent,
    UserProfileAgent,
    PersonalisedFeedAgent,
    DeepBriefingAgent,
    VernacularVideoAgent
)
from llm.router import llm

class OrchestratorAgent:
    def __init__(self):
        self.ingestion_agent = NewsIngestionAgent()
        self.processing_agent = ProcessingAgent()
        self.profile_agent = UserProfileAgent()
        self.feed_agent = PersonalisedFeedAgent()
        self.briefing_agent = DeepBriefingAgent()
        self.video_agent = VernacularVideoAgent()
        
        self.tools = {
            "ingest_news": self._ingest_news,
            "process_articles": self._process_articles,
            "score_for_persona": self._score_for_persona,
            "personalise_feed": self._personalise_feed,
            "create_briefing": self._create_briefing,
            "create_video": self._create_video,
            "done": lambda state: state
        }
    
    async def run_streaming(self, intent: str, state: NewsState) -> AsyncGenerator[Dict[str, Any], None]:
        max_steps = 10
        current_step = 0
        
        while current_step < max_steps:
            current_step += 1
            
            state_summary = self._create_state_summary(state)
            
            action_decision = self._decide_next_action(intent, state_summary, current_step)
            
            yield {
                "type": "decision",
                "step": current_step,
                "action": action_decision["action"],
                "reason": action_decision["reason"]
            }
            
            if action_decision["action"] == "done":
                yield {
                    "type": "complete",
                    "state": state
                }
                break
            
            if action_decision["action"] in self.tools:
                try:
                    tool_func = self.tools[action_decision["action"]]
                    params = action_decision.get("params", {})
                    
                    state = await self._execute_tool(tool_func, state, params)
                    
                    yield {
                        "type": "step_complete",
                        "action": action_decision["action"],
                        "trace": state["step_trace"][-1] if state["step_trace"] else {}
                    }
                except Exception as e:
                    add_error(state, str(e), action_decision["action"])
                    yield {
                        "type": "error",
                        "action": action_decision["action"],
                        "error": str(e)
                    }
            else:
                yield {
                    "type": "error",
                    "action": action_decision["action"],
                    "error": "Unknown action"
                }
                break
        
        yield {
            "type": "final",
            "state": state
        }
    
    def _create_state_summary(self, state: NewsState) -> str:
        return f"""Current State:
- Topic: {state['topic']}
- Raw articles: {len(state['raw_articles'])}
- Processed articles: {len(state['processed_articles'])}
- Personalised feed: {len(state['personalised_feed'])}
- Briefing created: {'yes' if state['briefing'] else 'no'}
- Video created: {'yes' if state.get('video_path') else 'no'}
- Persona: {state['user_profile'].get('persona', 'unknown')}
- Steps completed: {len(state['step_trace'])}"""
    
    def _decide_next_action(self, intent: str, state_summary: str, step: int) -> Dict[str, Any]:
        if step == 1:
            return {
                "action": "ingest_news",
                "reason": "First step: fetch articles for the topic",
                "params": {}
            }
        
        prompt = f"""You are an orchestrator deciding the next action in a news processing pipeline.

Intent: {intent}

{state_summary}

Available actions:
- ingest_news: Fetch articles (use first)
- process_articles: Extract entities, sentiment, importance (after ingestion)
- score_for_persona: Score articles for user persona (after processing)
- personalise_feed: Create personalized feed (after scoring)
- create_briefing: Generate multi-article briefing (after processing)
- create_video: Generate Hindi video (after processing, for video intent)
- done: Complete the pipeline

Decide the next action based on what's been done and what's needed.

Return ONLY valid JSON:
{{
  "action": "action_name",
  "reason": "why this action",
  "params": {{}}
}}"""

        try:
            response = llm.call("fast", prompt, temperature=0.2, max_tokens=200)
            
            response_clean = response.strip()
            if response_clean.startswith("```json"):
                response_clean = response_clean[7:]
            if response_clean.startswith("```"):
                response_clean = response_clean[3:]
            if response_clean.endswith("```"):
                response_clean = response_clean[:-3]
            response_clean = response_clean.strip()
            
            decision = json.loads(response_clean)
            return decision
        except Exception as e:
            print(f"Decision making failed: {e}, using fallback")
            return self._fallback_decision(state_summary)
    
    def _fallback_decision(self, state_summary: str) -> Dict[str, Any]:
        if "Raw articles: 0" in state_summary:
            return {"action": "ingest_news", "reason": "Need to fetch articles", "params": {}}
        elif "Processed articles: 0" in state_summary and "Raw articles:" in state_summary:
            return {"action": "process_articles", "reason": "Need to process articles", "params": {}}
        elif "Briefing created: no" in state_summary:
            return {"action": "create_briefing", "reason": "Need to create briefing", "params": {}}
        else:
            return {"action": "done", "reason": "Pipeline complete", "params": {}}
    
    async def _execute_tool(self, tool_func, state: NewsState, params: Dict[str, Any]) -> NewsState:
        return tool_func(state, **params)
    
    def _ingest_news(self, state: NewsState, **kwargs) -> NewsState:
        start_time = time.time()
        
        articles, metadata = self.ingestion_agent.fetch_articles(state['topic'])
        normalized = self.ingestion_agent.normalize_articles(articles)
        
        state['raw_articles'] = normalized
        
        time_ms = int((time.time() - start_time) * 1000)
        add_trace_step(
            state,
            "News Ingestion",
            "NewsIngestionAgent",
            "completed",
            time_ms,
            metadata
        )
        
        return state
    
    def _process_articles(self, state: NewsState, **kwargs) -> NewsState:
        processed, trace_steps = self.processing_agent.process_articles(state['raw_articles'])
        
        state['processed_articles'] = processed
        state['step_trace'].extend(trace_steps)
        
        return state
    
    def _score_for_persona(self, state: NewsState, **kwargs) -> NewsState:
        persona = state['user_profile'].get('persona', 'cfo')
        
        scored, metadata = self.profile_agent.score_articles_for_persona(
            state['processed_articles'],
            persona
        )
        
        state['processed_articles'] = scored
        
        add_trace_step(
            state,
            "Persona Scoring",
            "UserProfileAgent",
            "completed",
            metadata['time_ms'],
            metadata
        )
        
        return state
    
    def _personalise_feed(self, state: NewsState, **kwargs) -> NewsState:
        persona = state['user_profile'].get('persona', 'cfo')
        
        feed, metadata = self.feed_agent.create_personalised_feed(
            state['processed_articles'],
            persona
        )
        
        state['personalised_feed'] = feed
        
        add_trace_step(
            state,
            "Personalised Feed Creation",
            "PersonalisedFeedAgent",
            "completed",
            metadata['time_ms'],
            metadata
        )
        
        return state
    
    def _create_briefing(self, state: NewsState, **kwargs) -> NewsState:
        briefing, metadata = self.briefing_agent.create_briefing(
            state['processed_articles'],
            state['topic'],
            state['session_id']
        )
        
        state['briefing'] = briefing
        
        add_trace_step(
            state,
            "Deep Briefing Creation",
            "DeepBriefingAgent",
            "completed",
            metadata['time_ms'],
            metadata
        )
        
        return state
    
    def _create_video(self, state: NewsState, **kwargs) -> NewsState:
        if state['processed_articles']:
            article = state['processed_articles'][0]
        else:
            article = state['raw_articles'][0] if state['raw_articles'] else {}
        
        video_data, trace_steps = self.video_agent.create_video(article, state['session_id'])
        
        state['video_script_en'] = video_data['script_en']
        state['video_script_hi'] = video_data['script_hi']
        state['video_path'] = video_data['video_path']
        state['step_trace'].extend(trace_steps)
        
        return state
