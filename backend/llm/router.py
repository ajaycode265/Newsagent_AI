from litellm import completion
import os
from typing import Optional

# Remap deprecated/unavailable model names to working equivalents
_MODEL_REMAP = {
    "gemini/gemini-1.5-pro":          "gemini/gemini-2.5-pro",
    "gemini/gemini-1.5-pro-latest":   "gemini/gemini-2.5-pro",
    "gemini/gemini-1.5-flash":        "gemini/gemini-2.5-flash",
    "gemini/gemini-1.5-flash-latest": "gemini/gemini-2.5-flash",
    "gemini/gemini-2.0-flash":        "gemini/gemini-2.5-flash",
}

def _resolve(env_key: str, default: str) -> str:
    raw = os.getenv(env_key, default)
    return _MODEL_REMAP.get(raw, raw)

class LLMRouter:
    MODELS = {
        "synthesis":   _resolve("LLM_SYNTHESIS",  "gemini/gemini-2.5-pro"),
        "extraction":  _resolve("LLM_EXTRACTION", "gemini/gemini-2.5-flash"),
        "translation": _resolve("LLM_TRANSLATION","gemini/gemini-2.5-flash"),
        "creative":    _resolve("LLM_CREATIVE",   "gemini/gemini-2.5-pro"),
        "fast":        _resolve("LLM_FAST",        "gemini/gemini-2.5-flash"),
    }

    def call(self, tier: str, prompt: str, system: str = "", temperature: float = 0.3, max_tokens: int = 2000) -> str:
        msgs = ([{"role": "system", "content": system}] if system else [])
        msgs.append({"role": "user", "content": prompt})

        model = self.MODELS[tier]
        try:
            r = completion(
                model=model,
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
print(f"[LLMRouter] Models loaded: { {k: v for k, v in llm.MODELS.items()} }")
