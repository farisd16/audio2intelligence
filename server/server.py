from typing import Annotated, List, Optional, Dict, Any
from datetime import datetime
import os

from fastapi import Depends, FastAPI, UploadFile, Query, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import (
    Field,
    Session,
    SQLModel,
    create_engine,
    select,
    Relationship,
    Column,
    JSON,
    update,
)
from sqlalchemy.orm import selectinload
import assemblyai as aai
import uvicorn
from dotenv import load_dotenv
from pydantic import BaseModel

from llm import translate_text, generate_summary, generate_context_summary, find_code_words

load_dotenv()

aai.settings.api_key = os.environ.get("AAI_TOKEN")
config = aai.TranscriptionConfig(
    speaker_labels=True,
    language_code="ru",
)

app = FastAPI()

origins = [
    "http://localhost",
    "http://localhost:4200",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class Context(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    date: str = Field(default="")
    codewords: List[Dict[str, str]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )

    audio_samples: List["AudioSample"] = Relationship(back_populates="context")
    speakers: List["Speaker"] = Relationship(back_populates="context")


class AudioSample(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    description: str = Field(default="")
    utterances: List[Dict[str, Any]] = Field(
        default_factory=list, sa_column=Column(JSON)
    )

    context_id: Optional[int] = Field(default=None, foreign_key="context.id")
    context: Optional["Context"] = Relationship(back_populates="audio_samples")


class Speaker(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: Dict[str, str] = Field(default_factory=dict, sa_column=Column(JSON))
    description: str = Field(default="")

    context_id: Optional[int] = Field(default=None, foreign_key="context.id")
    context: Optional["Context"] = Relationship(back_populates="speakers")


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


class CreateContextDTO(BaseModel):
    name: str


class UploadSampleDTO(BaseModel):
    context_id: str

def parse_codewords(text: str) -> List[Dict[str, str]]:
    codewords_list = []
    for line in text.strip().split("\n"):
        if "-" in line:
            key, value = line.split("-", 1)
            codewords_list.append({
                "word": key.strip(),
                "meaning": value.strip()
            })
    return codewords_list

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


@app.get("/{context_id}")
def get_context(session: SessionDep, context_id: int):
    context = session.exec(
        select(Context)
        .options(selectinload(Context.audio_samples))
        .where(Context.id == context_id)
    ).first()

    audio_samples = session.exec(
        select(AudioSample).where(AudioSample.context_id == context_id)
    ).all()

    return {"context": context, "audio_samples": audio_samples}


@app.post("/create-context")
async def create_context(
    session: SessionDep, create_context_dto: CreateContextDTO
) -> int:
    date = datetime.utcnow()
    new_context = Context(
        name=create_context_dto.name,
        codewords=[],
        date=date.strftime("%B %d, %Y"),
    )

    session.add(new_context)
    session.commit()
    session.refresh(new_context)  # reload from DB to get auto-generated ID
    return new_context.id


@app.put("/upload")
async def upload_sample(
    session: SessionDep,
    context_id: int = Form(...),
    audio_sample: UploadFile = File(...),
):
    transcript = aai.Transcriber().transcribe(audio_sample.file, config)
    russian_text_to_translate = ""
    utterances = []

    print("Transcription done")

    for utterance in transcript.utterances:
        utterances.append(
            {
                "speaker": utterance.speaker,
                "start_time": utterance.start,
                "end_time": utterance.end,
                "text": {"ru": utterance.text, "en": ""},
            }
        )
        russian_text_to_translate += f"Speaker {utterance.speaker}: {utterance.text}\n"

    translated_english_text = translate_text(russian_text_to_translate)
    for idx, line in enumerate(translated_english_text.splitlines()):
        _, text = line.split(":", 1)  # split only at the first colon
        text = text.strip()
        utterances[idx]["text"]["en"] = text

    summarized_english_text = generate_summary(translated_english_text)

    new_audio_sample = AudioSample(
        name=audio_sample.filename,
        description=summarized_english_text,
        utterances=utterances,
        context_id=context_id,
    )
    session.add(new_audio_sample)
    session.commit()
    session.refresh(new_audio_sample)

    context_text = ""
    audio_samples = session.exec(
        select(AudioSample).where(AudioSample.context_id == context_id)
    ).all()
    for index, audio in enumerate(audio_samples, start=1):
        context_text += f"Audio Sample {index} : {audio.description}\n"
    summarized_context_text = generate_context_summary(context_text)

    possible_code_words = ""
    possible_code_words = find_code_words(summarized_context_text)
    code_words = parse_codewords(possible_code_words)

    stmt = (
        update(Context)
        .where(Context.id == context_id)
        .values(description=summarized_context_text, codewords=code_words)
    )
    
    session.exec(stmt)
    session.commit()

    return new_audio_sample


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
