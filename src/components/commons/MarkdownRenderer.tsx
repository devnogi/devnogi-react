"use client";

import { Fragment, ReactNode } from "react";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

const INLINE_TOKEN_REGEX =
  /(`[^`]+`|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*[^*]+\*\*|\*[^*]+\*|~~[^~]+~~)/g;

const BLOCK_PREFIX_REGEX = /^(#{1,6}\s+|>\s?|(\s*)[-*+]\s+|\d+\.\s+|```)/;
const LIST_ITEM_REGEX = /^(\s*)([-*+]|\d+\.)\s+(.*)$/;

type ListType = "ul" | "ol";

interface ListItemNode {
  key: string;
  content: ReactNode[];
  children: ReactNode[];
}

interface ListContext {
  type: ListType;
  indent: number;
  depth: number;
  items: ListItemNode[];
}

function parseInline(text: string): ReactNode[] {
  INLINE_TOKEN_REGEX.lastIndex = 0;
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  while ((match = INLINE_TOKEN_REGEX.exec(text)) !== null) {
    const token = match[0];
    const start = match.index;

    if (start > lastIndex) {
      parts.push(text.slice(lastIndex, start));
    }

    if (token.startsWith("`") && token.endsWith("`")) {
      parts.push(
        <code
          key={`code-${key++}`}
          className="rounded bg-gray-100 dark:bg-navy-600 px-1.5 py-0.5 text-[0.9em] font-mono"
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (token.startsWith("[") && token.includes("](") && token.endsWith(")")) {
      const textStart = token.indexOf("[") + 1;
      const textEnd = token.indexOf("]");
      const linkStart = token.indexOf("](") + 2;
      const linkEnd = token.length - 1;
      const linkText = token.slice(textStart, textEnd);
      const href = token.slice(linkStart, linkEnd);

      parts.push(
        <a
          key={`link-${key++}`}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-300 underline underline-offset-2 break-all"
        >
          {linkText}
        </a>,
      );
    } else if (token.startsWith("**") && token.endsWith("**")) {
      parts.push(<strong key={`strong-${key++}`}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*") && token.endsWith("*")) {
      parts.push(<em key={`em-${key++}`}>{token.slice(1, -1)}</em>);
    } else if (token.startsWith("~~") && token.endsWith("~~")) {
      parts.push(<del key={`del-${key++}`}>{token.slice(2, -2)}</del>);
    } else {
      parts.push(token);
    }

    lastIndex = start + token.length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts;
}

function paragraphWithBreaks(text: string, keyPrefix: string) {
  const lines = text.split("\n");
  return (
    <p className="leading-relaxed">
      {lines.map((line, index) => (
        <Fragment key={`${keyPrefix}-${index}`}>
          {parseInline(line)}
          {index < lines.length - 1 ? <br /> : null}
        </Fragment>
      ))}
    </p>
  );
}

export default function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  const lines = content.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let blockKey = 0;
  const listStack: ListContext[] = [];
  let listItemKey = 0;

  const getIndentWidth = (whitespace: string) => whitespace.replace(/\t/g, "    ").length;

  const renderListContext = (context: ListContext) => {
    const unorderedStyle =
      context.depth >= 2 ? "list-[square]" : context.depth === 1 ? "list-[circle]" : "list-disc";
    const baseClass =
      context.type === "ul"
        ? `${unorderedStyle} pl-4 space-y-1`
        : "list-decimal pl-4 space-y-1";

    const renderedItems = context.items.map((item) => (
      <li key={item.key} className="space-y-1">
        {item.content.length > 0 ? item.content : null}
        {item.children}
      </li>
    ));

    return context.type === "ul" ? (
      <ul key={`ul-${blockKey++}`} className={baseClass}>
        {renderedItems}
      </ul>
    ) : (
      <ol key={`ol-${blockKey++}`} className={baseClass}>
        {renderedItems}
      </ol>
    );
  };

  const appendNodeToParentOrBlocks = (node: ReactNode) => {
    if (listStack.length === 0) {
      blocks.push(node);
      return;
    }

    const parentContext = listStack[listStack.length - 1];
    const parentItems = parentContext.items;
    let parentItem = parentItems[parentItems.length - 1];

    if (!parentItem) {
      parentItem = {
        key: `li-${listItemKey++}`,
        content: [],
        children: [],
      };
      parentItems.push(parentItem);
    }

    parentItem.children.push(node);
  };

  const flushTopList = () => {
    const context = listStack.pop();
    if (!context) {
      return;
    }
    const rendered = renderListContext(context);
    appendNodeToParentOrBlocks(rendered);
  };

  const flushAllLists = () => {
    while (listStack.length) {
      flushTopList();
    }
  };

  const ensureListContext = (indent: number, type: ListType) => {
    while (listStack.length && indent < listStack[listStack.length - 1].indent) {
      flushTopList();
    }

    let current = listStack[listStack.length - 1];

    if (!current || indent > current.indent) {
      if (current) {
        const parentItems = current.items;
        if (parentItems.length === 0) {
          parentItems.push({
            key: `li-${listItemKey++}`,
            content: [],
            children: [],
          });
        }
      }
      const parentDepth = current ? current.depth : -1;
      const newContext: ListContext = {
        type,
        indent,
        depth: parentDepth + 1,
        items: [],
      };
      listStack.push(newContext);
      current = newContext;
    } else if (indent === current.indent && current.type !== type) {
      flushTopList();
      const parent = listStack[listStack.length - 1];
      const newContext: ListContext = {
        type,
        indent,
        depth: parent ? parent.depth + 1 : 0,
        items: [],
      };
      listStack.push(newContext);
      current = newContext;
    } else if (!current) {
      const parent = listStack[listStack.length - 1];
      const newContext: ListContext = {
        type,
        indent,
        depth: parent ? parent.depth + 1 : 0,
        items: [],
      };
      listStack.push(newContext);
      current = newContext;
    }

    return current;
  };

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushAllLists();
      i += 1;
      continue;
    }

    const listMatch = line.match(LIST_ITEM_REGEX);
    if (listMatch) {
      const indent = getIndentWidth(listMatch[1]);
      const marker = listMatch[2];
      const text = listMatch[3] ?? "";
      const listType: ListType = marker.endsWith(".") ? "ol" : "ul";

      const context = ensureListContext(indent, listType);
      context.items.push({
        key: `li-${listItemKey++}`,
        content: parseInline(text),
        children: [],
      });

      i += 1;
      continue;
    }

    flushAllLists();

    if (trimmed.startsWith("```")) {
      const language = trimmed.slice(3).trim();
      i += 1;
      const codeLines: string[] = [];
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeLines.push(lines[i]);
        i += 1;
      }
      if (i < lines.length) {
        i += 1;
      }

      blocks.push(
        <pre
          key={`pre-${blockKey++}`}
          className="overflow-x-auto rounded-lg bg-gray-900 text-gray-100 p-3 md:p-4 text-sm"
        >
          {language ? (
            <div className="mb-2 text-xs text-gray-300 uppercase tracking-wide">{language}</div>
          ) : null}
          <code>{codeLines.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2];
      const headingClass =
        level === 1
          ? "text-2xl font-bold"
          : level === 2
            ? "text-xl font-semibold"
            : level === 3
              ? "text-lg font-semibold"
              : "text-base font-semibold";

      blocks.push(
        <div key={`h-${blockKey++}`} className={headingClass}>
          {parseInline(headingText)}
        </div>,
      );
      i += 1;
      continue;
    }

    if (/^(\*\s*\*\s*\*|-{3,}|_{3,})$/.test(trimmed)) {
      blocks.push(<hr key={`hr-${blockKey++}`} className="border-gray-200 dark:border-navy-500" />);
      i += 1;
      continue;
    }

    if (line.startsWith(">")) {
      const quoteLines: string[] = [];
      while (i < lines.length && lines[i].startsWith(">")) {
        quoteLines.push(lines[i].replace(/^>\s?/, ""));
        i += 1;
      }

      blocks.push(
        <blockquote
          key={`q-${blockKey++}`}
          className="border-l-4 border-gray-300 dark:border-navy-400 pl-4 text-gray-700 dark:text-gray-300"
        >
          {paragraphWithBreaks(quoteLines.join("\n"), `q-p-${blockKey}`)}
        </blockquote>,
      );
      continue;
    }

    const paragraphLines: string[] = [];
    while (i < lines.length) {
      const current = lines[i];
      if (!current.trim()) {
        break;
      }
      if (BLOCK_PREFIX_REGEX.test(current.trim())) {
        break;
      }
      paragraphLines.push(current);
      i += 1;
    }

    if (paragraphLines.length > 0) {
      blocks.push(
        <div key={`p-${blockKey++}`}>
          {paragraphWithBreaks(paragraphLines.join("\n"), `p-${blockKey}`)}
        </div>,
      );
      continue;
    }

    i += 1;
  }

  flushAllLists();

  return (
    <div className={`space-y-3 text-[15px] md:text-base ${className ?? ""}`.trim()}>
      {blocks}
    </div>
  );
}
