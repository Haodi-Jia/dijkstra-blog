'use client'

import CharacterCount from '@tiptap/extension-character-count'
import Placeholder from '@tiptap/extension-placeholder'
import UnderlineExtension from '@tiptap/extension-underline'
import { EditorContent, useEditor, useEditorState } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import {
  Bold,
  Braces,
  Code2,
  Italic,
  Quote,
  Strikethrough,
  Underline
} from 'lucide-react'
import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react'

import { Button } from '@/components/ui/button'
import { EmojiPicker } from '@/features/posts/components/emoji-picker'
import { cn } from '@/lib/utils'

export type CommentEditorHandle = {
  clear: () => void
  focus: () => void
}

type EditorState = {
  bold: boolean
  italic: boolean
  underline: boolean
  strike: boolean
  code: boolean
  blockquote: boolean
  codeBlock: boolean
}

const EMPTY_EDITOR_STATE: EditorState = {
  bold: false,
  italic: false,
  underline: false,
  strike: false,
  code: false,
  blockquote: false,
  codeBlock: false
}

export const CommentEditor = forwardRef<CommentEditorHandle, {
  onChange: (html: string, characterCount: number) => void
  placeholder: string
}>(({ onChange, placeholder }, ref) => {
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  }, [onChange])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: false,
        heading: false,
        horizontalRule: false,
        link: false,
        listItem: false,
        orderedList: false
      }),
      UnderlineExtension,
      CharacterCount.configure({ limit: 2000 }),
      Placeholder.configure({ placeholder })
    ],
    editorProps: {
      attributes: {
        'aria-label': '评论内容',
        class: 'comment-content comment-editor min-h-[220px] px-6 py-5 text-[16px] leading-7 text-foreground/90 focus:outline-none'
      },
      transformPastedHTML: (html) => {
        const document = new DOMParser().parseFromString(html, 'text/html')
        const container = document.createElement('div')
        container.textContent = document.body.textContent ?? ''
        return container.innerHTML
      }
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChangeRef.current(
        currentEditor.getHTML(),
        currentEditor.storage.characterCount.characters()
      )
    }
  })

  useImperativeHandle(ref, () => ({
    clear: () => editor?.commands.clearContent(),
    focus: () => editor?.commands.focus()
  }), [editor])

  const activeState = useEditorState({
    editor,
    selector: ({ editor: currentEditor }) => currentEditor ? ({
      bold: currentEditor.isActive('bold'),
      italic: currentEditor.isActive('italic'),
      underline: currentEditor.isActive('underline'),
      strike: currentEditor.isActive('strike'),
      code: currentEditor.isActive('code'),
      blockquote: currentEditor.isActive('blockquote'),
      codeBlock: currentEditor.isActive('codeBlock')
    }) : EMPTY_EDITOR_STATE
  }) ?? EMPTY_EDITOR_STATE

  const tools = [
    { key: 'bold', label: '粗体', icon: Bold, action: () => editor?.chain().focus().toggleBold().run() },
    { key: 'italic', label: '斜体', icon: Italic, action: () => editor?.chain().focus().toggleItalic().run() },
    { key: 'underline', label: '下划线', icon: Underline, action: () => editor?.chain().focus().toggleUnderline().run() },
    { key: 'strike', label: '删除线', icon: Strikethrough, action: () => editor?.chain().focus().toggleStrike().run() },
    { key: 'code', label: '行内代码', icon: Braces, action: () => editor?.chain().focus().toggleCode().run() },
    { key: 'blockquote', label: '引用', icon: Quote, action: () => editor?.chain().focus().toggleBlockquote().run() },
    { key: 'codeBlock', label: '代码块', icon: Code2, action: () => editor?.chain().focus().toggleCodeBlock().run() }
  ] as const

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-300 bg-background shadow-[0_0_0_5px_rgba(226,232,240,0.65)] transition-[border-color,box-shadow] focus-within:border-slate-400 focus-within:shadow-[0_0_0_5px_rgba(203,213,225,0.55)] dark:border-input dark:shadow-none">
      <EditorContent editor={editor} />
      <div className="flex min-h-14 items-center gap-0.5 border-t border-border/70 px-3 py-2">
        {tools.map(({ action, icon: Icon, key, label }) => (
          <Button
            aria-label={label}
            aria-pressed={activeState[key]}
            className={cn(
              'size-10 rounded-lg text-muted-foreground',
              activeState[key] && 'bg-accent text-foreground'
            )}
            key={key}
            onClick={action}
            size="icon"
            title={label}
            type="button"
            variant="ghost"
          >
            <Icon className="size-5" />
          </Button>
        ))}
        <span className="mx-1 h-5 w-px bg-border" />
        <EmojiPicker onSelect={(emoji) => editor?.chain().focus().insertContent(emoji).run()} />
        <span className="ml-auto text-xs text-muted-foreground/70">
          {editor?.storage.characterCount.characters() ?? 0}/2000
        </span>
      </div>
    </div>
  )
})

CommentEditor.displayName = 'CommentEditor'
