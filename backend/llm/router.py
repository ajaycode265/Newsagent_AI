from litellm import completion
import os
from typing import Optional

class LLMRouter:
    MODELS = {
        "synthesis":  os.getenv("LLM_SYNTHESIS",  "gpt-4o"),
        "extraction": os.getenv("LLM_EXTRACTION", "gpt-4o-mini"),
        "translation":os.getenv("LLM_TRANSLATION","gpt-4o-mini"),
        "creative":   os.getenv("LLM_CREATIVE",   "gpt-4o"),
        "fast":       os.getenv("LLM_FAST",        "groq/llama3-8b-8192"),
    }
    
    def call(self, tier: str, prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 2000) -> str:
        msgs = ([{"role":"system","content":system}] if system else [])
        msgs.append({"role":"user","content":prompt})
        
        try:
            r = completion(
                model=self.MODELS[tier], 
                messages=msgs,
                temperature=temperature, 
                max_tokens=max_tokens
            )
            return r.choices[0].message.content
        except Exception as e:
            print(f"LLM call failed for tier {tier}: {e}")
            return f"Error: {str(e)}"
    
    def get_model_name(self, tier: str) -> str:
        return self.MODELS.get(tier, "unknown")

llm = LLMRouter()
