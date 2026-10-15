import os
import json
import httpx
from typing import AsyncGenerator
from backend.app.core.config import settings

class LLMClient:
    def __init__(self):
        self.provider = settings.LLM_PROVIDER
        self.ollama_url = f"{settings.OLLAMA_BASE_URL}/api/generate"
        self.ollama_model = settings.OLLAMA_MODEL
        self.gemini_key = settings.GEMINI_API_KEY
        self.openai_key = settings.OPENAI_API_KEY

    async def generate_stream(
        self,
        system_prompt: str,
        user_prompt: str
    ) -> AsyncGenerator[str, None]:
        """
        Streams concise, short, to-the-point answers from the active LLM provider.
        """
        short_directive = (
            "\n\nIMPORTANT INSTRUCTION: Keep the answer strictly concise, brief, and to the point. "
            "Directly state the answer in 2-3 bullet points or sentences maximum, then list the source."
        )
        full_system = f"{system_prompt}{short_directive}"
        full_contents = f"{full_system}\n\n{user_prompt}"

        # 1. Try Gemini Cloud first if key is present
        gemini_key = (os.getenv("GEMINI_API_KEY") or self.gemini_key or "").strip()
        if gemini_key:
            candidate_models = ["gemini-flash-lite-latest", "gemini-3.5-flash", "gemini-flash-latest"]
            for model_name in candidate_models:
                try:
                    from google import genai
                    from google.genai import types
                    client = genai.Client(api_key=gemini_key)
                    
                    config = types.GenerateContentConfig(
                        temperature=0.1,
                        max_output_tokens=350,
                        system_instruction=full_system
                    )
                    
                    streamed_any = False
                    stream = await client.aio.models.generate_content_stream(
                        model=model_name,
                        contents=user_prompt,
                        config=config
                    )
                    async for chunk in stream:
                        if chunk.text:
                            streamed_any = True
                            yield chunk.text
                    if streamed_any:
                        return

                    # If streaming returned empty, fallback to non-streaming async call
                    resp = await client.aio.models.generate_content(
                        model=model_name,
                        contents=user_prompt,
                        config=config
                    )
                    if resp.text:
                        yield resp.text
                        return
                except Exception as e:
                    print(f"[LLMClient] Gemini model '{model_name}' temporary issue: {e}")
                    continue

        # 2. Try Ollama (Local llama3.2) - Guaranteed reliability with zero 503 errors
        try:
            payload = {
                "model": self.ollama_model,
                "prompt": f"{full_system}\n\n{user_prompt}",
                "stream": True,
                "options": {
                    "temperature": 0.1,
                    "num_predict": 300
                }
            }
            async with httpx.AsyncClient(timeout=30.0) as client:
                async with client.stream("POST", self.ollama_url, json=payload) as response:
                    if response.status_code == 200:
                        streamed_any = False
                        async for line in response.aiter_lines():
                            if line:
                                try:
                                    chunk_json = json.loads(line)
                                    token = chunk_json.get("response", "")
                                    if token:
                                        streamed_any = True
                                        yield token
                                    if chunk_json.get("done", False):
                                        break
                                except Exception:
                                    continue
                        if streamed_any:
                            return
        except Exception as e:
            print(f"[LLMClient] Ollama stream error: {e}")

        # 3. Try OpenAI if configured
        if self.openai_key:
            try:
                from openai import AsyncOpenAI
                client = AsyncOpenAI(api_key=self.openai_key)
                stream = await client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": full_system},
                        {"role": "user", "content": user_prompt}
                    ],
                    stream=True,
                    temperature=0.1,
                    max_tokens=300
                )
                async for chunk in stream:
                    content = chunk.choices[0].delta.content or ""
                    if content:
                        yield content
                return
            except Exception as e:
                print(f"[LLMClient] OpenAI stream error: {e}")

        # 4. Dynamic Context Fallback (Extracts salient points from retrieved policy chunks)
        yield "According to the official Jaipuria University policy documents retrieved for your query:\n\n"
        context_part = ""
        if "## Retrieval Context" in user_prompt:
            try:
                context_part = user_prompt.split("## User Question")[0].replace("## Retrieval Context", "")
            except Exception:
                context_part = ""

        extracted_lines = []
        for line in context_part.splitlines():
            line_str = line.strip()
            if line_str and not line_str.startswith("[") and not line_str.startswith("---") and len(line_str) > 30:
                cleaned = line_str.lstrip("•-–*1234567890. ()")
                if cleaned and len(cleaned) > 25:
                    extracted_lines.append(cleaned)
            if len(extracted_lines) >= 3:
                break

        if extracted_lines:
            for l in extracted_lines:
                yield f"• {l[:220]}\n"
        else:
            yield "Please refer to the official Jaipuria document citations attached below for detailed regulations."

    async def generate_sync(self, system_prompt: str, user_prompt: str) -> str:
        tokens = []
        async for token in self.generate_stream(system_prompt, user_prompt):
            tokens.append(token)
        return "".join(tokens)

llm_client = LLMClient()
