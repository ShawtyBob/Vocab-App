import { VocabData } from "@/types";

const HISTORY_KEY = "vocab_search_history";
const SAVED_KEY = "vocab_saved_items";


export const getSearchHistory = (): string[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(HISTORY_KEY);
  return data ? JSON.parse(data) : [];
};

export const addSearchHistory = (word: string): string[] => {
  if (typeof window === "undefined") return [];
  let history = getSearchHistory();

  history = history.filter((w) => w.toLowerCase() !== word.toLowerCase());
  history.unshift(word);

  history = history.slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  return history;
};

export const getSavedVocabs = (): Record<string, VocabData> => {
  if (typeof window === "undefined") return {};
  const data = localStorage.getItem(SAVED_KEY);
  return data ? JSON.parse(data) : {};
};

export const toggleSaveVocab = (vocab: VocabData): boolean => {
  if (typeof window === "undefined") return false;
  const saved = getSavedVocabs();
  const key = vocab.word.toLowerCase();
  
  if (saved[key]) {
    delete saved[key]; // Unsave
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return false;
  } else {
    saved[key] = vocab; // Save
    localStorage.setItem(SAVED_KEY, JSON.stringify(saved));
    return true;
  }
};