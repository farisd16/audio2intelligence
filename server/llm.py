import os

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)


def translate_text(russian_text: str) -> str:
    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant whose task is to translate text from Russian to English.",
            },
            {
                "role": "user",
                "content": f"""\
                    You will be given text in the format "Speaker <X>: <transcribed_speech>".
                    Your response will only change the language of the <transcribed speech>".
                    You MUST stick to the existing format, and do not add any unnecessary modifications.
                    Here is the text:
                    {russian_text}
                """,
            },
        ],
    )
    response = completion.choices[0].message.content
    print(f"LLM translated text to English:\n{response}")
    return response


def generate_summary(text: str) -> str:
    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful assistant whose task is to summarize text. Be concise and use a maximum of 6 sentences.",
            },
            {
                "role": "user",
                "content": f"""\
                    Return ONLY the summarized text. Here is the original text:
                    {text}
                """,
            },
        ],
    )
    response = completion.choices[0].message.content
    print(f"LLM summarized text:\n{response}")
    return response
