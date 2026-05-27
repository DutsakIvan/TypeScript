import type { CipherType } from "../types";

const UA_ALPHABET = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";
const EN_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export function caesarEncrypt(text: string, shift: number): string {
  return text
    .split("")
    .map(char => {
      const upperChar = char.toUpperCase();
      const uaIdx = UA_ALPHABET.indexOf(upperChar);
      if (uaIdx !== -1) {
        const newIdx = (uaIdx + shift) % UA_ALPHABET.length;
        return char === upperChar
          ? UA_ALPHABET[newIdx]
          : UA_ALPHABET[newIdx].toLowerCase();
      }
      const enIdx = EN_ALPHABET.indexOf(upperChar);
      if (enIdx !== -1) {
        const newIdx = (enIdx + shift) % EN_ALPHABET.length;
        return char === upperChar
          ? EN_ALPHABET[newIdx]
          : EN_ALPHABET[newIdx].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function caesarDecrypt(text: string, shift: number): string {
  return caesarEncrypt(text, -shift + UA_ALPHABET.length);
}

export function vigenereEncrypt(text: string, key: string): string {
  const keyUpper = key.toUpperCase();
  let keyIdx = 0;

  return text
    .split("")
    .map(char => {
      const upperChar = char.toUpperCase();
      const uaIdx = UA_ALPHABET.indexOf(upperChar);
      if (uaIdx !== -1) {
        const keyCharIdx = UA_ALPHABET.indexOf(
          keyUpper[keyIdx % keyUpper.length]
        );
        if (keyCharIdx === -1) {
          keyIdx++;
          return char;
        }
        const newIdx = (uaIdx + keyCharIdx) % UA_ALPHABET.length;
        keyIdx++;
        return char === upperChar
          ? UA_ALPHABET[newIdx]
          : UA_ALPHABET[newIdx].toLowerCase();
      }
      const enIdx = EN_ALPHABET.indexOf(upperChar);
      if (enIdx !== -1) {
        const keyChar = keyUpper[keyIdx % keyUpper.length];
        const keyEnIdx = EN_ALPHABET.indexOf(keyChar);
        if (keyEnIdx === -1) {
          keyIdx++;
          return char;
        }
        const newIdx = (enIdx + keyEnIdx) % EN_ALPHABET.length;
        keyIdx++;
        return char === upperChar
          ? EN_ALPHABET[newIdx]
          : EN_ALPHABET[newIdx].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function vigenereDecrypt(text: string, key: string): string {
  const keyUpper = key.toUpperCase();
  let keyIdx = 0;

  return text
    .split("")
    .map(char => {
      const upperChar = char.toUpperCase();
      const uaIdx = UA_ALPHABET.indexOf(upperChar);
      if (uaIdx !== -1) {
        const keyCharIdx = UA_ALPHABET.indexOf(
          keyUpper[keyIdx % keyUpper.length]
        );
        if (keyCharIdx === -1) {
          keyIdx++;
          return char;
        }
        const newIdx =
          (uaIdx - keyCharIdx + UA_ALPHABET.length) % UA_ALPHABET.length;
        keyIdx++;
        return char === upperChar
          ? UA_ALPHABET[newIdx]
          : UA_ALPHABET[newIdx].toLowerCase();
      }
      const enIdx = EN_ALPHABET.indexOf(upperChar);
      if (enIdx !== -1) {
        const keyChar = keyUpper[keyIdx % keyUpper.length];
        const keyEnIdx = EN_ALPHABET.indexOf(keyChar);
        if (keyEnIdx === -1) {
          keyIdx++;
          return char;
        }
        const newIdx =
          (enIdx - keyEnIdx + EN_ALPHABET.length) % EN_ALPHABET.length;
        keyIdx++;
        return char === upperChar
          ? EN_ALPHABET[newIdx]
          : EN_ALPHABET[newIdx].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function atbashEncrypt(text: string): string {
  return text
    .split("")
    .map(char => {
      const upperChar = char.toUpperCase();
      const uaIdx = UA_ALPHABET.indexOf(upperChar);
      if (uaIdx !== -1) {
        const newIdx = UA_ALPHABET.length - 1 - uaIdx;
        return char === upperChar
          ? UA_ALPHABET[newIdx]
          : UA_ALPHABET[newIdx].toLowerCase();
      }
      const enIdx = EN_ALPHABET.indexOf(upperChar);
      if (enIdx !== -1) {
        const newIdx = EN_ALPHABET.length - 1 - enIdx;
        return char === upperChar
          ? EN_ALPHABET[newIdx]
          : EN_ALPHABET[newIdx].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function base64Encode(text: string): string {
  try {
    return btoa(unescape(encodeURIComponent(text)));
  } catch {
    return btoa(text);
  }
}

export function base64Decode(text: string): string {
  try {
    return decodeURIComponent(escape(atob(text)));
  } catch {
    try {
      return atob(text);
    } catch {
      return "[DECODE ERROR]";
    }
  }
}

export function hexEncode(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(16).padStart(2, "0"))
    .join(" ");
}

export function hexDecode(hex: string): string {
  const bytes = hex
    .trim()
    .split(/\s+/)
    .map(h => parseInt(h, 16));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export function binaryEncode(text: string): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => b.toString(2).padStart(8, "0"))
    .join(" ");
}

export function binaryDecode(binary: string): string {
  const bytes = binary
    .trim()
    .split(/\s+/)
    .map(b => parseInt(b, 2));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

const MORSE_MAP: Record<string, string> = {
  A: ".-",
  B: "-...",
  C: "-.-.",
  D: "-..",
  E: ".",
  F: "..-.",
  G: "--.",
  H: "....",
  I: "..",
  J: ".---",
  K: "-.-",
  L: ".-..",
  M: "--",
  N: "-.",
  O: "---",
  P: ".--.",
  Q: "--.-",
  R: ".-.",
  S: "...",
  T: "-",
  U: "..-",
  V: "...-",
  W: ".--",
  X: "-..-",
  Y: "-.--",
  Z: "--..",
  "0": "-----",
  "1": ".----",
  "2": "..---",
  "3": "...--",
  "4": "....-",
  "5": ".....",
  "6": "-....",
  "7": "--...",
  "8": "---..",
  "9": "----.",
  " ": "/",

  А: ".-",
  Б: "-...",
  В: ".--",
  Г: "--.",
  Д: "-..",
  Е: ".",
  Ж: "...-",
  З: "--..",
  И: "..",
  К: "-.-",
  Л: ".-..",
  М: "--",
  Н: "-.",
  О: "---",
  П: ".--.",
  Р: ".-.",
  С: "...",
  Т: "-",
  У: "..-",
  Ф: "..-.",
  Х: "....",
  Ц: "-.-.",
  Ч: "---.",
  Ш: "----",
  Щ: "--.-",
  Ь: "-..-",
  Ю: "..--",
  Я: ".-.-",
  І: "..",
  Ї: ".---.",
  Є: "..-..",
  Ґ: "--.",
};

const MORSE_REVERSE: Record<string, string> = {};
Object.entries(MORSE_MAP).forEach(([k, v]) => {
  MORSE_REVERSE[v] = k;
});

export function morseEncode(text: string): string {
  return text
    .toUpperCase()
    .split("")
    .map(c => MORSE_MAP[c] ?? c)
    .join(" ");
}

export function morseDecode(morse: string): string {
  return morse
    .split(" ")
    .map(code => {
      if (code === "/") return " ";
      return MORSE_REVERSE[code] ?? "?";
    })
    .join("");
}

export function xorEncrypt(text: string, key: number): string {
  return Array.from(new TextEncoder().encode(text))
    .map(b => (b ^ key).toString(16).padStart(2, "0"))
    .join(" ");
}

export function xorDecrypt(hex: string, key: number): string {
  const bytes = hex
    .trim()
    .split(/\s+/)
    .map(h => parseInt(h, 16) ^ key);
  return new TextDecoder().decode(new Uint8Array(bytes));
}

export function generateSubstitutionKey(seed: number): Record<string, string> {
  const shuffled = EN_ALPHABET.split("");
  let s = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) % 4294967296;
    const j = Math.floor((s / 4294967296) * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const key: Record<string, string> = {};
  for (let i = 0; i < EN_ALPHABET.length; i++) {
    key[EN_ALPHABET[i]] = shuffled[i];
  }
  return key;
}

export function substitutionEncrypt(
  text: string,
  key: Record<string, string>
): string {
  return text
    .split("")
    .map(char => {
      const upper = char.toUpperCase();
      if (key[upper]) {
        return char === upper ? key[upper] : key[upper].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function substitutionDecrypt(
  text: string,
  key: Record<string, string>
): string {
  const reverseKey: Record<string, string> = {};
  Object.entries(key).forEach(([k, v]) => {
    reverseKey[v] = k;
  });
  return text
    .split("")
    .map(char => {
      const upper = char.toUpperCase();
      if (reverseKey[upper]) {
        return char === upper
          ? reverseKey[upper]
          : reverseKey[upper].toLowerCase();
      }
      return char;
    })
    .join("");
}

export function cipherEncrypt(
  text: string,
  type: CipherType,
  key: string | number
): string {
  switch (type) {
    case "caesar":
      return caesarEncrypt(
        text,
        typeof key === "number" ? key : parseInt(key as string) || 3
      );
    case "vigenere":
      return vigenereEncrypt(text, String(key));
    case "atbash":
      return atbashEncrypt(text);
    case "base64":
      return base64Encode(text);
    case "hex":
      return hexEncode(text);
    case "binary":
      return binaryEncode(text);
    case "morse":
      return morseEncode(text);
    case "xor":
      return xorEncrypt(
        text,
        typeof key === "number" ? key : parseInt(key as string) || 42
      );
    case "substitution":
      return substitutionEncrypt(
        text,
        generateSubstitutionKey(typeof key === "number" ? key : 12345)
      );
    default:
      return text;
  }
}

export function cipherDecrypt(
  text: string,
  type: CipherType,
  key: string | number
): string {
  switch (type) {
    case "caesar":
      return caesarDecrypt(
        text,
        typeof key === "number" ? key : parseInt(key as string) || 3
      );
    case "vigenere":
      return vigenereDecrypt(text, String(key));
    case "atbash":
      return atbashEncrypt(text);
    case "base64":
      return base64Decode(text);
    case "hex":
      return hexDecode(text);
    case "binary":
      return binaryDecode(text);
    case "morse":
      return morseDecode(text);
    case "xor":
      return xorDecrypt(
        text,
        typeof key === "number" ? key : parseInt(key as string) || 42
      );
    case "substitution":
      return substitutionDecrypt(
        text,
        generateSubstitutionKey(typeof key === "number" ? key : 12345)
      );
    default:
      return text;
  }
}

export function frequencyAnalysis(text: string): Record<string, number> {
  const freq: Record<string, number> = {};
  const cleaned = text.toUpperCase().replace(/[^A-ZА-ЯІЇЄҐ]/g, "");
  for (const char of cleaned) {
    freq[char] = (freq[char] || 0) + 1;
  }
  const total = cleaned.length;
  Object.keys(freq).forEach(k => {
    freq[k] = Math.round((freq[k] / total) * 10000) / 100;
  });
  return freq;
}

export const UA_FREQUENCY: Record<string, number> = {
  О: 9.36,
  А: 7.72,
  Н: 6.95,
  І: 6.38,
  И: 5.79,
  В: 5.29,
  Е: 4.62,
  Р: 4.48,
  Т: 4.15,
  С: 3.89,
  К: 3.49,
  Л: 3.44,
  Д: 3.27,
  П: 3.09,
  У: 2.9,
  М: 2.82,
  З: 2.32,
  Я: 2.12,
  Б: 1.84,
  Г: 1.63,
  Ч: 1.55,
  Й: 1.37,
  Х: 1.21,
  Ж: 1.01,
  Ш: 0.84,
  Ц: 0.79,
  Щ: 0.46,
  Ф: 0.32,
  Ю: 0.31,
  Ь: 2.9,
  Є: 0.16,
  Ї: 0.1,
  Ґ: 0.01,
};
