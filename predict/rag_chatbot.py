import requests 
import os
import sys


class RAGChatbot:
    def __init__(self):
        pass

    def generate_response(self, user_query, ollama_model_name="gemma:2b"):
        from dotenv import load_dotenv

        env_path = os.path.join(os.path.dirname(__file__), "..", "..", "Backend", ".env")
        load_dotenv(env_path)

        hf_api_key = os.getenv("HUGGINGFACE_API_KEY")
        hf_model = "meta-llama/Llama-3.2-1B-Instruct"

        system_instruction = (
            "You are TechGri, a highly knowledgeable and professional Agricultural AI Specialist for the SmartFarm project. "
            "Your expertise covers crop management, pest control, soil health, and modern farming techniques.\n\n"
        )

        if hf_api_key and hf_api_key.startswith("hf_"):
            try:
                print(f"Attempting Hugging Face (Chat API) with: {hf_model}", file=sys.stderr)
                CHAT_API_URL = "https://router.huggingface.co/v1/chat/completions"
                chat_payload = {
                    "model": hf_model,
                    "messages": [
                        {"role": "system", "content": system_instruction},
                        {"role": "user", "content": user_query}
                    ],
                    "max_tokens": 500,
                    "stream": False
                }
                headers = {"Authorization": f"Bearer {hf_api_key}"}
                chat_response = requests.post(CHAT_API_URL, headers=headers, json=chat_payload, timeout=25)
                if chat_response.status_code == 200:
                    return chat_response.json()["choices"][0]["message"]["content"].strip()
                else:
                    print(f"Hugging Face Chat API returned {chat_response.status_code}: {chat_response.text}", file=sys.stderr)
            except Exception as e:
                print(f"Hugging Face Chat API Error: {str(e)}", file=sys.stderr)

        try:
            prompt = (
                f"<|begin_of_text|><|start_header_id|>system<|end_header_id|>\n\n{system_instruction}<|eot_id|>"
                f"<|start_header_id|>user<|end_header_id|>\n\nAnswer the following agricultural question based on your extensive knowledge. "
                "Be specific and provide actionable advice.\n\n"
                f"Question: {user_query}<|eot_id|><|start_header_id|>assistant<|end_header_id|>\n\n"
            )
            response = requests.post(
                "http://localhost:11434/api/generate",
                json={
                    "model": ollama_model_name,
                    "prompt": prompt,
                    "stream": False
                }
            )
            response.raise_for_status()
            return response.json().get("response", "Error: No response from model.")
        except requests.exceptions.ConnectionError:
            return "Error: Could not connect to Ollama. Is it running? (run 'ollama serve')"
        except Exception as e:
            return f"Error communicating with Ollama: {str(e)}"


if __name__ == '__main__':
    chatbot = RAGChatbot()
    while True:
        user_input = input("You: ")
        if user_input.lower() == 'exit':
            break
        response = chatbot.generate_response(user_input)
        print(f"Bot: {response}")
