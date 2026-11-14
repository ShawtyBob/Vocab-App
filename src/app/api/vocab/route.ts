import { NextRequest, NextResponse } from "next/server";
import { VocabData } from "@/types";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const word = searchParams.get("word");

  if (!word) {
    return NextResponse.json({ error: "Word parameter is required" }, { status: 400 });
  }

  try {
    const res = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
    if (!res.ok) {
      return NextResponse.json({ error: "ไม่พบคำศัพท์นี้" }, { status: 404 });
    }

    const data = await res.json();
    const entry = data[0];

    const audioObj = entry.phonetics?.find((p: any) => p.audio && p.audio !== "");
    const audioUrl = audioObj ? audioObj.audio : "";

    let examples: string[] = [];
    entry.meanings?.forEach((m: any) => {
      m.definitions?.forEach((d: any) => {
        if (d.example) examples.push(d.example);
      });
    });

    while (examples.length < 5) {
      examples.push(`Example sentence ${examples.length + 1} using the word "${entry.word}".`);
    }
    examples = examples.slice(0, 5);

    const result: VocabData = {
      word: entry.word,
      phonetic: entry.phonetic || "",
      audio: audioUrl,
      meaning_en: entry.meanings[0]?.definitions[0]?.definition || "No definition found.",
      meaning_th: "ความหมายภาษาไทย",
      examples: examples,
    };

    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}