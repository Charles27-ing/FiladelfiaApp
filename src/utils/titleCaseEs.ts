export function toTitleCaseEs(input: string): string {
  if (!input) return input;

  const lowerWords = new Set([
    'de', 'del', 'la', 'las', 'el', 'los', 'y', 'o', 'u', 'a', 'e',
    'da', 'do', 'das', 'dos', 'san', 'santa'
  ]);

  return input
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word, index) => {
      if (word.length === 0) return word;
      // Mantener minúsculas para conectores salvo si es la primera palabra
      if (index > 0 && lowerWords.has(word)) return word;
      const first = word.charAt(0).toLocaleUpperCase('es-ES');
      const rest = word.slice(1);
      return `${first}${rest}`;
    })
    .join(' ');
}



