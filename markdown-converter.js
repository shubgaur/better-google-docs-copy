// Markdown Converter - Converts Google Docs API response to Markdown

/**
 * Extract plain text from document (no formatting)
 */
function extractPlainText(doc) {
  let plainText = '';

  // Add document title if available
  if (doc.title && doc.title.trim()) {
    plainText += `${doc.title}\n\n`;
  }

  // Process document body
  if (doc.body && doc.body.content) {
    for (const element of doc.body.content) {
      if (element.paragraph && element.paragraph.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            plainText += elem.textRun.content;
          }
        }
      }
    }
  }

  return plainText;
}

/**
 * Main conversion function
 */
function convertToMarkdown(doc, images, comments, options) {
  // If plain text only mode, extract and return plain text
  if (options.plainTextOnly) {
    return extractPlainText(doc);
  }

  const imagesMap = new Map(images.map(img => [img.id, img]));
  const footnotesMap = new Map();
  let footnoteCounter = 1;

  // Build footnotes map
  if (doc.footnotes) {
    for (const [footnoteId, footnote] of Object.entries(doc.footnotes)) {
      footnotesMap.set(footnoteId, {
        number: footnoteCounter++,
        content: footnote.content
      });
    }
  }

  let markdown = '';

  // Add document title if available (use doc.title, not body content)
  if (doc.title && doc.title.trim()) {
    markdown += `# ${doc.title}\n\n`;
  }

  // Process document body
  if (doc.body && doc.body.content) {
    // Skip the first element if it's the title (Google Docs includes title in body)
    let contentToProcess = doc.body.content;
    if (contentToProcess.length > 0 && contentToProcess[0].paragraph) {
      const firstPara = contentToProcess[0].paragraph;
      const style = firstPara.paragraphStyle?.namedStyleType;
      // Skip if it's a TITLE style paragraph
      if (style === 'TITLE') {
        contentToProcess = contentToProcess.slice(1);
      }
    }
    markdown += processContent(contentToProcess, imagesMap, doc, options, footnotesMap);
  }

  // Append footnotes if any exist
  if (footnotesMap.size > 0) {
    markdown += '\n---\n\n## Footnotes\n\n';
    for (const [footnoteId, footnoteData] of footnotesMap.entries()) {
      const footnoteContent = processContent(footnoteData.content, imagesMap, doc, options, footnotesMap);
      markdown += `[^${footnoteData.number}]: ${footnoteContent.trim()}\n\n`;
    }
  }

  // Append comments section if requested
  if (options.includeComments && comments.length > 0) {
    // Filter out resolved comments if setting is disabled
    let commentsToInclude = comments;
    if (!options.includeResolvedComments) {
      commentsToInclude = comments.filter(c => !c.resolved);
    }

    if (commentsToInclude.length > 0) {
      const commentFormat = options.commentFormat || 'xml';

      if (commentFormat === 'xml') {
        markdown += '\n<comments>\n';
        markdown += formatComments(commentsToInclude);
        markdown += '</comments>\n';
      } else if (commentFormat === 'blockquote') {
        markdown += '\n## Comments\n\n';
        markdown += formatCommentsAsBlockquotes(commentsToInclude);
      }
    }
  }

  return markdown;
}

/**
 * Process document content recursively
 */
function processContent(content, imagesMap, doc, options, footnotesMap) {
  let markdown = '';

  for (const element of content) {
    if (element.paragraph) {
      markdown += processParagraph(element.paragraph, imagesMap, doc, options, footnotesMap);
    } else if (element.table) {
      markdown += processTable(element.table, imagesMap, doc, options, footnotesMap);
    } else if (element.tableOfContents) {
      markdown += '> *Table of Contents*\n\n';
    } else if (element.sectionBreak) {
      markdown += '\n---\n\n';
    }
  }

  return markdown;
}

/**
 * Process a paragraph element
 */
function processParagraph(paragraph, imagesMap, doc, options, footnotesMap) {
  let text = '';
  let isListItem = false;
  let listLevel = 0;
  let listType = 'unordered';
  let listNumber = 1;

  // Check if this is a list item
  if (paragraph.bullet) {
    isListItem = true;
    listLevel = paragraph.bullet.nestingLevel || 0;
    const listId = paragraph.bullet.listId;

    // Look up list properties to determine if ordered or unordered
    if (doc.lists && doc.lists[listId]) {
      const listProperties = doc.lists[listId];
      const nestingLevel = listProperties.listProperties?.nestingLevels?.[listLevel];

      if (nestingLevel) {
        // Check glyph type - if it's not a bullet, it's ordered
        const glyphType = nestingLevel.glyphType;
        if (glyphType && glyphType !== 'BULLET') {
          listType = 'ordered';
          // Get start number if specified
          listNumber = nestingLevel.startNumber || 1;
        }
      }
    }
  }

  // Process paragraph elements (text runs, inline objects, etc.)
  if (paragraph.elements) {
    for (const elem of paragraph.elements) {
      if (elem.textRun) {
        text += processTextRun(elem.textRun);
      } else if (elem.inlineObjectElement && options.includeImages) {
        const objectId = elem.inlineObjectElement.inlineObjectId;
        const image = imagesMap.get(objectId);
        if (image) {
          // Use the URL instead of base64 for cleaner markdown
          // Use image title if available for better alt text
          const altText = image.title || 'Image';
          text += `![${altText}](${image.url})`;
        }
      } else if (elem.footnoteReference && footnotesMap) {
        // Add footnote reference
        const footnoteId = elem.footnoteReference.footnoteId;
        const footnoteData = footnotesMap.get(footnoteId);
        if (footnoteData) {
          text += `[^${footnoteData.number}]`;
        }
      }
    }
  }

  // Remove trailing newlines from text content
  text = text.replace(/\n+$/, '');

  // Skip empty paragraphs (just newlines)
  if (!text.trim()) {
    return '\n';
  }

  // Format based on paragraph style
  const style = paragraph.paragraphStyle?.namedStyleType || 'NORMAL_TEXT';

  let prefix = '';
  let suffix = '\n\n';

  // Handle list items
  if (isListItem) {
    const indent = '  '.repeat(listLevel);
    if (listType === 'ordered') {
      prefix = `${indent}1. `;
    } else {
      prefix = `${indent}- `;
    }
    suffix = '\n';
  }
  // Handle headings
  else if (style === 'HEADING_1' || style === 'TITLE') {
    const headingStyle = options.headingStyle || 'atx';
    if (headingStyle === 'setext' && (style === 'HEADING_1' || style === 'TITLE')) {
      suffix = '\n' + '='.repeat(Math.min(text.length, 50)) + '\n\n';
    } else {
      prefix = '# ';
    }
  } else if (style === 'HEADING_2' || style === 'SUBTITLE') {
    const headingStyle = options.headingStyle || 'atx';
    if (headingStyle === 'setext' && (style === 'HEADING_2' || style === 'SUBTITLE')) {
      suffix = '\n' + '-'.repeat(Math.min(text.length, 50)) + '\n\n';
    } else {
      prefix = '## ';
    }
  } else if (style === 'HEADING_3') {
    prefix = '### ';
  } else if (style === 'HEADING_4') {
    prefix = '#### ';
  } else if (style === 'HEADING_5') {
    prefix = '##### ';
  } else if (style === 'HEADING_6') {
    prefix = '###### ';
  }

  return prefix + text + suffix;
}

/**
 * Process a text run with formatting
 */
function processTextRun(textRun) {
  let text = textRun.content || '';
  const style = textRun.textStyle || {};

  // Apply formatting
  if (style.bold && style.italic) {
    text = `***${text}***`;
  } else if (style.bold) {
    text = `**${text}**`;
  } else if (style.italic) {
    text = `*${text}*`;
  }

  if (style.strikethrough) {
    text = `~~${text}~~`;
  }

  if (style.underline) {
    // Markdown doesn't have native underline, use HTML
    text = `<u>${text}</u>`;
  }

  // Handle links
  if (style.link && style.link.url) {
    // Validate URL to prevent malformed or malicious links
    const url = style.link.url;
    const isValidUrl = /^(https?:\/\/|mailto:|tel:)/i.test(url);

    if (isValidUrl) {
      // Don't wrap if the text is already the URL
      if (text.trim() !== url) {
        text = `[${text.trim()}](${url})`;
      } else {
        text = url;
      }
    }
    // If invalid URL, just keep the text without making it a link
  }

  // Handle code - check for common monospace fonts
  const monospaceFonts = [
    'Consolas',
    'Courier New',
    'Courier',
    'Monaco',
    'Menlo',
    'Source Code Pro',
    'Roboto Mono',
    'Ubuntu Mono',
    'Fira Mono',
    'Fira Code',
    'Inconsolata',
    'SF Mono',
    'Lucida Console'
  ];

  const fontFamily = style.weightedFontFamily?.fontFamily;
  if (fontFamily && monospaceFonts.includes(fontFamily)) {
    text = `\`${text}\``;
  }

  return text;
}

/**
 * Process a table element
 */
function processTable(table, imagesMap, doc, options, footnotesMap) {
  let markdown = '\n';

  if (!table.tableRows || table.tableRows.length === 0) {
    return markdown;
  }

  const rows = table.tableRows;

  // Process each row
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.tableCells || [];

    // Build row
    let rowText = '| ';
    for (const cell of cells) {
      let cellText = '';
      if (cell.content) {
        cellText = processContent(cell.content, imagesMap, doc, options, footnotesMap).trim();
        // Remove extra newlines from cell content
        cellText = cellText.replace(/\n+/g, ' ');
      }
      rowText += cellText + ' | ';
    }
    markdown += rowText + '\n';

    // Add separator after first row (header)
    if (i === 0) {
      markdown += '| ' + cells.map(() => '---').join(' | ') + ' |\n';
    }
  }

  markdown += '\n';
  return markdown;
}

/**
 * Format comments section with XML structure for LLM readability
 */
function formatComments(comments) {
  let markdown = '';

  for (const comment of comments) {
    const status = comment.resolved ? 'resolved' : 'open';

    markdown += `  <comment status="${status}">\n`;

    // Show quoted text if available
    if (comment.quotedText) {
      markdown += `    <quoted_text>${escapeXml(comment.quotedText)}</quoted_text>\n`;
    }

    // Main comment
    markdown += `    <author>${escapeXml(comment.author)}</author>\n`;
    markdown += `    <content>${escapeXml(comment.content)}</content>\n`;

    // Replies
    if (comment.replies && comment.replies.length > 0) {
      markdown += `    <replies>\n`;
      for (const reply of comment.replies) {
        markdown += `      <reply>\n`;
        markdown += `        <author>${escapeXml(reply.author)}</author>\n`;
        markdown += `        <content>${escapeXml(reply.content)}</content>\n`;
        markdown += `      </reply>\n`;
      }
      markdown += `    </replies>\n`;
    }

    markdown += `  </comment>\n\n`;
  }

  return markdown;
}

/**
 * Format comments as blockquotes (alternative to XML)
 */
function formatCommentsAsBlockquotes(comments) {
  let markdown = '';

  for (const comment of comments) {
    const status = comment.resolved ? '✓ Resolved' : '○ Open';

    markdown += `**${status}**\n\n`;

    // Show quoted text if available (escape markdown to prevent formatting issues)
    if (comment.quotedText) {
      markdown += `> Re: "${escapeMarkdown(comment.quotedText)}"\n\n`;
    }

    // Main comment (escape content to prevent markdown injection)
    markdown += `**${escapeMarkdown(comment.author)}**: ${escapeMarkdown(comment.content)}\n\n`;

    // Replies
    if (comment.replies && comment.replies.length > 0) {
      for (const reply of comment.replies) {
        markdown += `  → **${escapeMarkdown(reply.author)}**: ${escapeMarkdown(reply.content)}\n\n`;
      }
    }

    markdown += '---\n\n';
  }

  return markdown;
}

/**
 * Escape XML special characters
 */
function escapeXml(text) {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Escape markdown special characters to prevent unintended formatting
 */
function escapeMarkdown(text) {
  if (!text) return '';
  return text
    .replace(/\\/g, '\\\\')   // Backslash
    .replace(/\*/g, '\\*')    // Asterisk
    .replace(/_/g, '\\_')     // Underscore
    .replace(/\[/g, '\\[')    // Square brackets
    .replace(/\]/g, '\\]')
    .replace(/\(/g, '\\(')    // Parentheses
    .replace(/\)/g, '\\)')
    .replace(/~/g, '\\~')     // Tilde
    .replace(/`/g, '\\`')     // Backtick
    .replace(/>/g, '\\>')     // Greater than (blockquote)
    .replace(/#/g, '\\#')     // Hash (headers)
    .replace(/\+/g, '\\+')    // Plus
    .replace(/-/g, '\\-')     // Dash
    .replace(/\./g, '\\.')    // Period
    .replace(/!/g, '\\!')     // Exclamation
    .replace(/\|/g, '\\|');   // Pipe
}

// Make convertToMarkdown available globally for background.js
if (typeof window !== 'undefined') {
  window.convertToMarkdown = convertToMarkdown;
}
