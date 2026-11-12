import { marked } from 'marked';
import sanitizeHtml from 'sanitize-html';

export function renderMarkdown(content) {
  const html = marked.parse(String(content || ''), {gfm:true,breaks:true});
  return sanitizeHtml(html, {
    allowedTags: ['p','br','strong','em','del','blockquote','ul','ol','li','h1','h2','h3','h4','hr','pre','code','table','thead','tbody','tr','th','td','a'],
    allowedAttributes: {a:['href','title','rel'],code:['class']},
    allowedSchemes:['https'],allowProtocolRelative:false,
    transformTags: {a: sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})},
  });
}
