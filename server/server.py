from typing import Annotated, List, Optional, Dict, Any
from datetime import datetime
import os

from fastapi import Depends, FastAPI, UploadFile, Query
from sqlmodel import (
    Field,
    Session,
    SQLModel,
    create_engine,
    select,
    Relationship,
    Column,
    JSON,
)
import assemblyai as aai
import uvicorn
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

client = OpenAI(
    base_url="https://router.huggingface.co/v1",
    api_key=os.environ.get("HF_TOKEN"),
)

aai.settings.api_key = os.environ.get("AAI_TOKEN")
config = aai.TranscriptionConfig(
    speaker_labels=True,
    language_code="ru",
)

app = FastAPI()


class Context(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    date: datetime
    codewords: List[Dict[str, str]] = Field(
        default=[], default_factory=list, sa_column=Column(JSON)
    )

    audio_samples: List["AudioSample"] = Relationship(back_populates="context")
    speakers: List["Speaker"] = Relationship(back_populates="context")


class AudioSample(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    utterances: List[Dict[str, str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )

    context_id: Optional[int] = Field(default=None, foreign_key="context.id")
    context: Optional[Context] = Relationship(back_populates="audio_samples")


class Speaker(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    description: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))

    context_id: Optional[int] = Field(default=None, foreign_key="context.id")
    context: Optional[Context] = Relationship(back_populates="speakers")


class Hierarchy(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)


sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session


SessionDep = Annotated[Session, Depends(get_session)]

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
async def get_contexts(
    session: SessionDep,
    offset: int = 0,
    limit: Annotated[int, Query(le=100)] = 100,
) -> list[Context]:
    contexts = session.exec(select(Context).offset(offset).limit(limit)).all()
    return contexts


@app.post("/create-context")
async def create_context(session: SessionDep, name: str) -> int:
    new_context = Context(
        name=name,
        date=datetime.now(datetime.timezone.cet),
    )

    session.add(new_context)
    session.commit()
    session.refresh(new_context)  # reload from DB to get auto-generated ID
    return new_context.id


@app.put("/upload")
async def upload_sample(session: SessionDep, audio_sample: UploadFile):
    transcript = aai.Transcriber().transcribe(audio_sample.file, config)
    russian_text = ""
    for utterance in transcript.utterances:
        russian_text += f"Speaker {utterance.speaker}: {utterance.text}\n"
    completion = client.chat.completions.create(
        model="deepseek-ai/DeepSeek-V3.2-Exp:novita",
        messages=[
            {
                "role": "user",
                "content": f"Translate this text from Russian to English:{russian_text}"
            }
        ],
    )
    print(completion.choices[0].message.content)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
