// Pequenos construtores de blocos para a documentação.
// Mantêm o conteúdo independente do formato de saída (DOCX/PDF/Markdown).

export const h1 = (number, title, lead = null) => ({ type: 'h1', number, title, lead });
export const h2 = (text) => ({ type: 'h2', text });
export const h3 = (text) => ({ type: 'h3', text });
export const p = (text) => ({ type: 'p', text });
export const lead = (text) => ({ type: 'lead', text });
export const bullets = (...items) => ({ type: 'bullets', items });
export const numbered = (...items) => ({ type: 'numbered', items });
export const table = (headers, rows, options = {}) => ({ type: 'table', headers, rows, ...options });
export const callout = (tone, title, text) => ({ type: 'callout', tone, title, text });
export const code = (text, lang = '') => ({ type: 'code', text, lang });
export const figure = (src, caption, widthCm = 16) => ({ type: 'figure', src, caption, widthCm });
export const pagebreak = () => ({ type: 'pagebreak' });
export const quote = (text) => ({ type: 'quote', text });
