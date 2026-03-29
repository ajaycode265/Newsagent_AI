from litellm import completion
import os

class LLMRouter:
    MODELS = {
        "synthesis":   "groq/llama-3.3-70b-versatile",
        "extraction":  "groq/llama-3.1-8b-instant",
        "translation": "groq/llama-3.1-8b-instant",
        "creative":    "groq/llama-3.3-70b-versatile",
        "fast":        "groq/llama-3.1-8b-instant",
    }

    def call(self, tier: str, prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 2000) -> str:
        msgs = ([{"role": "system", "content": system}] if system else [])
        msgs.append({"role": "user", "content": prompt})

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
