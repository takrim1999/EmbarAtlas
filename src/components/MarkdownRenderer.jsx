import React, { useMemo } from 'react';
import { renderMarkdown } from '../lib/markdown';

function cleanLatexMath(text) {
  if (!text) return '';
  return text
    // Replace fractions: $\frac{1}{6}$ -> 1/6
    .replace(/\$\\frac\{([^}]+)\}\{([^}]+)\}\$/g, '$1/$2')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1/$2')
    // Replace approx: $\sim 0$ -> ~0
    .replace(/\$\\sim\s*([^$]+)\$/g, '~$1')
    .replace(/\\sim\s*([0-9.]+)/g, '~$1')
    // Replace oxygen: $\text{O}_2$ or \text{O}_2 -> O₂
    .replace(/\$\\text\{O\}_2\$/gi, 'O₂')
    .replace(/\\text\{O\}_2/gi, 'O₂')
    .replace(/O_2/g, 'O₂')
    // Replace math operators
    .replace(/\\times/g, '×')
    .replace(/\\mu/g, 'μ')
    // Replace \text{unit}
    .replace(/\\text\{([^}]+)\}/g, '$1')
    // Replace inline units like $6.2 mm/s$
    .replace(/\$([0-9.]+)\s*([a-zA-Z/°%]+)\$/g, '$1 $2')
    // Strip stray dollar signs
    .replace(/\$([^\n$]+)\$/g, '$1');
}

export default function MarkdownRenderer({ content, className = '' }) {
  const html = useMemo(() => {
    if (!content) return '';
    const cleaned = cleanLatexMath(content);
    return renderMarkdown(cleaned);
  }, [content]);

  return (
    <div
      className={`ai-response ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
