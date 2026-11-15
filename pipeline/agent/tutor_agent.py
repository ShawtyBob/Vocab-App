import json
import os
from datetime import datetime

from dotenv import load_dotenv
from google import genai
from langchain_core.messages import AIMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_google_genai import ChatGoogleGenerativeAI

# โหลด API Key จาก .env
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("ไม่พบ GEMINI_API_KEY ในไฟล์ .env")
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Setup Model
llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=os.getenv("GEMINI_API_KEY"), temperature=0.7)
prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are an encouraging English Tutor. Correct any grammar mistakes in the user's input, explain the correction briefly and respond shortly.",
        ),
        MessagesPlaceholder(variable_name="history"),
        ("human", "{input}"),
    ]
)

chain = prompt | llm


def start_session():
    history = []
    logs = []
    session_id = datetime.now().strftime("%Y%m%d_%H%M%S")

    print("=== English Tutor Started (type 'exit' to quit) ===\n")

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "exit":
            break

        response = chain.invoke({"input": user_input, "history": history})
        print(f"\nTutor: {response.content}\n")

        history.append(HumanMessage(content=user_input))
        history.append(AIMessage(content=response.content))

        # Format Data
        logs.append({"session_id": session_id, "timestamp": datetime.now().isoformat(), "user_input": user_input, "tutor_response": response.content})

    # Save Raw JSON in data/raw
    output_dir = os.path.join("..", "..", "data", "raw")
    os.makedirs(output_dir, exist_ok=True)
    file_path = os.path.join(output_dir, f"session_{session_id}.json")

    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(logs, f, ensure_ascii=False, indent=2)

    print(f"\n[Pipeline Ingestion] Log saved to: {file_path}")


if __name__ == "__main__":
    start_session()
