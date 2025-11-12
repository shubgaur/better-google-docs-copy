// Markdown Converter - Converts Google Docs API response to Markdown

// ============================================================================
// CONSTANTS & OPTIMIZATIONS
// ============================================================================

// Pre-compiled Set for O(1) monospace font lookup
const MONOSPACE_FONTS = new Set([
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
]);

// Pre-compiled regex patterns for performance
const URL_VALIDATION_REGEX = /^(https?:\/\/|mailto:|tel:)/i;

/**
 * Extract plain text from document (no formatting)
 * Optimized with array join instead of string concatenation
 */
function extractPlainText(doc) {
  const parts = [];

  // Add document title if available
  if (doc.title && doc.title.trim()) {
    parts.push(doc.title, '\n\n');
  }

  // Process document body
  if (doc.body && doc.body.content) {
    for (const element of doc.body.content) {
      if (element.paragraph && element.paragraph.elements) {
        for (const elem of element.paragraph.elements) {
          if (elem.textRun && elem.textRun.content) {
            parts.push(elem.textRun.content);
          }
        }
      }
    }
  }

  return parts.join('');
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

  // Build comments map by quoted text for inline insertion
  const commentsMap = new Map();
  const insertedCommentIds = new Set(); // Track which comments were inserted inline

  if (options.includeComments && comments && comments.length > 0) {
    // Filter out resolved comments if setting is disabled
    let commentsToProcess = comments;
    if (!options.includeResolvedComments) {
      commentsToProcess = comments.filter(c => !c.resolved);
    }

    console.log(`Processing ${commentsToProcess.length} comments for inline insertion`);

    // Group comments by their quoted text (normalized for matching)
    for (const comment of commentsToProcess) {
      if (comment.quotedText && comment.quotedText.trim().length > 0) {
        // Store both the original and normalized text for better matching
        const quotedText = comment.quotedText.trim();
        if (!commentsMap.has(quotedText)) {
          commentsMap.set(quotedText, []);
        }
        commentsMap.get(quotedText).push(comment);
        console.log(`✓ Added comment to map - Author: "${comment.author}", Quoted: "${quotedText.substring(0, 50)}...", Content: "${comment.content.substring(0, 30)}..."`);
      } else {
        console.log(`✗ Comment has NO quoted text - Author: "${comment.author}", Content: "${comment.content.substring(0, 50)}..." - will only appear in end section`);
      }
    }

    console.log(`Built commentsMap with ${commentsMap.size} unique quoted texts`);
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
    markdown += processContent(contentToProcess, imagesMap, doc, options, footnotesMap, commentsMap, insertedCommentIds);
  }

  // Append footnotes if any exist
  if (footnotesMap.size > 0) {
    markdown += '\n---\n\n## Footnotes\n\n';
    for (const [footnoteId, footnoteData] of footnotesMap.entries()) {
      const footnoteContent = processContent(footnoteData.content, imagesMap, doc, options, footnotesMap, new Map(), new Set());
      markdown += `[^${footnoteData.number}]: ${footnoteContent.trim()}\n\n`;
    }
  }

  // Append remaining comments section (for comments that weren't inserted inline)
  console.log(`🔍 End-of-document check: includeComments=${options.includeComments}, total comments=${comments.length}`);

  if (options.includeComments && comments.length > 0) {
    // Filter out resolved comments if setting is disabled
    let commentsToInclude = comments;
    if (!options.includeResolvedComments) {
      commentsToInclude = comments.filter(c => !c.resolved);
    }

    // Only include comments that weren't inserted inline
    const generalComments = commentsToInclude.filter(c => !insertedCommentIds.has(c.id));

    console.log(`📊 FINAL COMMENT SUMMARY: ${insertedCommentIds.size} comments inserted inline, ${generalComments.length} comments for end section`);

    if (generalComments.length > 0) {
      const commentFormat = options.commentFormat || 'xml';
      console.log(`📝 Adding ${generalComments.length} comments to end section using format: ${commentFormat}`);

      for (const comment of generalComments) {
        console.log(`  - "${comment.author}": "${comment.content.substring(0, 40)}..."`);
      }

      if (commentFormat === 'xml') {
        console.log('Adding <comments> XML section to output');
        markdown += '\n<comments>\n';
        markdown += formatComments(generalComments);
        markdown += '</comments>\n';
      } else if (commentFormat === 'blockquote') {
        console.log('Adding ## Comments blockquote section to output');
        markdown += '\n## Comments\n\n';
        markdown += formatCommentsAsBlockquotes(generalComments);
      }
    } else {
      console.log('⚠️ No comments to add to end section (all were inserted inline or filtered out)');
    }
  }

  return markdown;
}

/**
 * Process document content recursively
 * Optimized with array join for better performance
 */
function processContent(content, imagesMap, doc, options, footnotesMap, commentsMap = new Map(), insertedCommentIds = new Set()) {
  const parts = [];

  for (const element of content) {
    if (element.paragraph) {
      parts.push(processParagraph(element.paragraph, imagesMap, doc, options, footnotesMap, commentsMap, insertedCommentIds));
    } else if (element.table) {
      parts.push(processTable(element.table, imagesMap, doc, options, footnotesMap, commentsMap, insertedCommentIds));
    } else if (element.tableOfContents) {
      parts.push('> *Table of Contents*\n\n');
    } else if (element.sectionBreak) {
      parts.push('\n---\n\n');
    }
  }

  return parts.join('');
}

/**
 * Process a paragraph element
 */
function processParagraph(paragraph, imagesMap, doc, options, footnotesMap, commentsMap = new Map(), insertedCommentIds = new Set()) {
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

  // Check if this paragraph contains any commented text and insert inline comments
  if (commentsMap.size > 0) {
    text = insertInlineComments(text, commentsMap, options, insertedCommentIds);
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

  // Handle links (using pre-compiled regex for performance)
  if (style.link && style.link.url) {
    // Validate URL to prevent malformed or malicious links
    const url = style.link.url;
    const isValidUrl = URL_VALIDATION_REGEX.test(url);

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

  // Handle code - check for common monospace fonts (using pre-compiled Set for O(1) lookup)
  const fontFamily = style.weightedFontFamily?.fontFamily;
  if (fontFamily && MONOSPACE_FONTS.has(fontFamily)) {
    text = `\`${text}\``;
  }

  return text;
}

/**
 * Insert inline comments into text where quoted text matches
 */
function insertInlineComments(text, commentsMap, options, insertedCommentIds = new Set()) {
  if (!text || commentsMap.size === 0) {
    return text;
  }

  const commentFormat = options.commentFormat || 'xml';

  // Normalize text for matching (remove extra whitespace, lowercase)
  const normalizeForMatching = (str) => {
    return str.replace(/\s+/g, ' ').trim().toLowerCase();
  };

  const normalizedText = normalizeForMatching(text);

  // Try to find matching comments for this text
  for (const [quotedText, commentsList] of commentsMap.entries()) {
    // Strip trailing "..." from truncated Drive API responses before matching
    const cleanedQuotedText = quotedText.replace(/\.\.\.+$/, '').trim();
    const normalizedQuoted = normalizeForMatching(cleanedQuotedText);

    // Check if this paragraph contains the quoted text
    if (normalizedText.includes(normalizedQuoted)) {
      console.log(`Found match for quoted text: "${quotedText.substring(0, 50)}..." in paragraph`);

      // Try to find the quoted text position in the original text (case-insensitive, flexible whitespace)
      // Strip trailing "..." from truncated Drive API responses
      const cleanedQuotedText = quotedText.replace(/\.\.\.+$/, '').trim();

      // Escape special regex characters but allow flexible whitespace
      const regexPattern = cleanedQuotedText
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')  // Escape special chars
        .replace(/\s+/g, '\\s+');  // Allow flexible whitespace

      const quotedTextRegex = new RegExp(regexPattern, 'i');
      const match = text.match(quotedTextRegex);

      if (match) {
        // Found exact position - insert inline comment here
        console.log(`Inserting comment inline after "${match[0].substring(0, 30)}..." at position ${match.index}`);

        // Format all comments for this quoted text
        let commentMarker = '';

        if (commentFormat === 'xml') {
          for (const comment of commentsList) {
            commentMarker += `\n<!-- Comment by ${escapeXml(comment.author)}: ${escapeXml(comment.content)}`;
            if (comment.replies && comment.replies.length > 0) {
              for (const reply of comment.replies) {
                commentMarker += `\n  Reply by ${escapeXml(reply.author)}: ${escapeXml(reply.content)}`;
              }
            }
            commentMarker += ' -->';

            // Mark this comment as inserted inline
            insertedCommentIds.add(comment.id);
          }
        } else {
          // Blockquote format
          for (const comment of commentsList) {
            commentMarker += `\n> 💬 **${escapeMarkdown(comment.author)}**: ${escapeMarkdown(comment.content)}`;
            if (comment.replies && comment.replies.length > 0) {
              for (const reply of comment.replies) {
                commentMarker += `\n> → **${escapeMarkdown(reply.author)}**: ${escapeMarkdown(reply.content)}`;
              }
            }

            // Mark this comment as inserted inline
            insertedCommentIds.add(comment.id);
          }
        }

        const insertPosition = match.index + match[0].length;
        text = text.slice(0, insertPosition) + commentMarker + text.slice(insertPosition);
      } else {
        // Could not find exact position - don't insert inline, let it appear in end section
        console.log(`Could not find exact position for "${cleanedQuotedText.substring(0, 30)}...", will appear in comments section at end`);
        // Do NOT mark as inserted - let it appear in the end-of-document comments section
      }
    }
  }

  return text;
}

/**
 * Process a table element
 */
function processTable(table, imagesMap, doc, options, footnotesMap, commentsMap = new Map(), insertedCommentIds = new Set()) {
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
        cellText = processContent(cell.content, imagesMap, doc, options, footnotesMap, commentsMap, insertedCommentIds).trim();
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
 * Optimized with array join for better performance
 */
function formatComments(comments) {
  const parts = [];

  for (const comment of comments) {
    const status = comment.resolved ? 'resolved' : 'open';
    const commentParts = [`  <comment status="${status}">\n`];

    // Show quoted text if available
    if (comment.quotedText) {
      commentParts.push(`    <quoted_text>${escapeXml(comment.quotedText)}</quoted_text>\n`);
    }

    // Main comment
    commentParts.push(
      `    <author>${escapeXml(comment.author)}</author>\n`,
      `    <content>${escapeXml(comment.content)}</content>\n`
    );

    // Replies
    if (comment.replies && comment.replies.length > 0) {
      commentParts.push(`    <replies>\n`);
      for (const reply of comment.replies) {
        commentParts.push(
          `      <reply>\n`,
          `        <author>${escapeXml(reply.author)}</author>\n`,
          `        <content>${escapeXml(reply.content)}</content>\n`,
          `      </reply>\n`
        );
      }
      commentParts.push(`    </replies>\n`);
    }

    commentParts.push(`  </comment>\n\n`);
    parts.push(commentParts.join(''));
  }

  return parts.join('');
}

/**
 * Format comments as blockquotes (alternative to XML)
 * Optimized with array join for better performance
 */
function formatCommentsAsBlockquotes(comments) {
  const parts = [];

  for (const comment of comments) {
    const status = comment.resolved ? '✓ Resolved' : '○ Open';
    const commentParts = [`**${status}**\n\n`];

    // Show quoted text if available (escape markdown to prevent formatting issues)
    if (comment.quotedText) {
      commentParts.push(`> Re: "${escapeMarkdown(comment.quotedText)}"\n\n`);
    }

    // Main comment (escape content to prevent markdown injection)
    commentParts.push(`**${escapeMarkdown(comment.author)}**: ${escapeMarkdown(comment.content)}\n\n`);

    // Replies
    if (comment.replies && comment.replies.length > 0) {
      for (const reply of comment.replies) {
        commentParts.push(`  → **${escapeMarkdown(reply.author)}**: ${escapeMarkdown(reply.content)}\n\n`);
      }
    }

    commentParts.push('---\n\n');
    parts.push(commentParts.join(''));
  }

  return parts.join('');
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
