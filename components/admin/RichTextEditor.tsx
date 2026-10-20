'use client';

import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Unlink,
  Undo,
  Redo,
  Minus,
} from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
  placeholder?: string;
  className?: string;
}

export function RichTextEditor({
  value,
  onChange,
  label = 'Story & Narrative (Rich Text)',
  className = '',
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3],
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber underline hover:text-amber-light transition-colors',
        },
      }),
    ],
    content: value || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          'min-h-[160px] p-4 text-sm font-sans text-offwhite focus:outline-none prose prose-invert max-w-none prose-headings:font-title prose-headings:text-offwhite prose-p:leading-relaxed prose-a:text-amber',
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  if (!editor) {
    return null;
  }

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('Enter link URL:', previousUrl);

    if (url === null) return;
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const btnClass = (active: boolean) =>
    `p-2 rounded-xl transition-all text-xs ${
      active
        ? 'bg-amber text-black shadow-[0_0_12px_rgba(245,158,11,0.3)] font-semibold'
        : 'text-offwhite-dim hover:text-offwhite hover:bg-charcoal-subtle'
    }`;

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="block font-mono text-[11px] uppercase tracking-wider text-offwhite-dim font-medium">
            {label}
          </label>
          <span className="font-mono text-[10px] text-offwhite-muted">
            TIPTAP RICH TEXT
          </span>
        </div>
      )}

      <div className="rounded-2xl border border-charcoal-border bg-charcoal/60 overflow-hidden focus-within:border-amber focus-within:ring-1 focus-within:ring-amber transition-all">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 p-2 bg-charcoal border-b border-charcoal-border">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive('bold'))}
            title="Bold"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive('italic'))}
            title="Italic"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive('strike'))}
            title="Strikethrough"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-charcoal-border mx-1" />

          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            className={btnClass(editor.isActive('heading', { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            className={btnClass(editor.isActive('heading', { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-charcoal-border mx-1" />

          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive('bulletList'))}
            title="Bullet List"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive('orderedList'))}
            title="Numbered List"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            className={btnClass(editor.isActive('blockquote'))}
            title="Pull Quote"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-charcoal-border mx-1" />

          <button
            type="button"
            onClick={setLink}
            className={btnClass(editor.isActive('link'))}
            title="Add Link"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          {editor.isActive('link') && (
            <button
              type="button"
              onClick={() => editor.chain().focus().unsetLink().run()}
              className={btnClass(false)}
              title="Remove Link"
            >
              <Unlink className="w-3.5 h-3.5 text-safelight" />
            </button>
          )}

          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btnClass(false)}
            title="Divider Rule"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>

          <span className="w-px h-4 bg-charcoal-border mx-1 ml-auto" />

          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite disabled:opacity-30 transition-colors"
            title="Undo"
          >
            <Undo className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-2 rounded-xl text-offwhite-dim hover:text-offwhite disabled:opacity-30 transition-colors"
            title="Redo"
          >
            <Redo className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Editor Body */}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
