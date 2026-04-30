import sys
import json
import logging

# Configure logging to stderr so it doesn't interfere with stdout JSON
logging.basicConfig(level=logging.ERROR, stream=sys.stderr)

try:
    from rag_chatbot import RAGChatbot
except ImportError:
    sys.path.append(".")
    from rag_chatbot import RAGChatbot


def main():
    # Read from stdin
    try:
        input_data = sys.stdin.read()
        if not input_data:
            raise ValueError("No input data received from stdin")

        request = json.loads(input_data)
        query = request.get("query")

        if not query:
            raise ValueError("No 'query' field in input JSON")

    except Exception as e:
        print(json.dumps({"response": "Error processing input.", "error": str(e)}))
        return

    try:
        chatbot = RAGChatbot()
        response = chatbot.generate_response(query)

        output = {"response": response}
        print(json.dumps(output))

    except Exception as e:
        logging.error(f"Error processing query: {e}")
        error_output = {
            "response": "I encountered an error while processing your request.",
            "error": str(e)
        }
        print(json.dumps(error_output))


if __name__ == "__main__":
    main()
