'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Youtube from '@tiptap/extension-youtube';
import { useEffect, useRef, useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface RichTextEditorProps {
  value: string;
  onChange: (html: string) => void;
  label?: string;
}

function Btn({
  onCmd,
  active,
  title,
  children,
}: {
  onCmd: () => void;
  active?: boolean;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      onMouseDown={(e) => {
        e.preventDefault(); // evita que el editor pierda el foco
        onCmd();
      }}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors select-none ${
        active
          ? 'bg-primary text-white'
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({ value, onChange, label = 'Contenido' }: RichTextEditorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [showYt, setShowYt] = useState(false);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      LinkExtension.configure({ openOnClick: false }),
      ImageExtension.configure({ allowBase64: false }),
      Youtube.configure({ controls: true, width: 640, height: 360 }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'outline-none min-h-[320px] p-4 prose prose-sm max-w-none prose-headings:font-bold prose-headings:text-gray-900 prose-p:text-gray-700 prose-li:text-gray-700 prose-blockquote:border-l-primary',
      },
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== value) {
      editor.commands.setContent(value || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const uploadImage = async (file: File) => {
    if (!storage) { alert('Firebase Storage no configurado.'); return; }
    setUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const storageRef = ref(storage, `blog-images/${filename}`);
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      editor?.chain().focus().setImage({ src: url }).run();
    } catch {
      alert('Error al subir la imagen.');
    }
    setUploading(false);
  };

  const insertYoutube = () => {
    if (!ytUrl.trim()) return;
    editor?.commands.setYoutubeVideo({ src: ytUrl });
    setYtUrl('');
    setShowYt(false);
  };

  if (!editor) return null;

  const sep = <div className="w-px h-5 bg-gray-200 mx-0.5 self-center" />;

  return (
    <div className="space-y-1">
      <label className="block text-xs font-medium text-gray-500">{label}</label>

      <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-all">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">

          {/* Párrafo y encabezados — todos como botones con onMouseDown */}
          <Btn onCmd={() => editor.chain().focus().setParagraph().run()}
              active={editor.isActive('paragraph')} title="Párrafo normal">
            ¶
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              active={editor.isActive('heading', { level: 1 })} title="Título 1">
            H1
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              active={editor.isActive('heading', { level: 2 })} title="Título 2">
            H2
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              active={editor.isActive('heading', { level: 3 })} title="Título 3">
            H3
          </Btn>

          {sep}

          {/* Formato inline */}
          <Btn onCmd={() => editor.chain().focus().toggleBold().run()}
              active={editor.isActive('bold')} title="Negrita (Ctrl+B)">
            <strong>B</strong>
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleItalic().run()}
              active={editor.isActive('italic')} title="Cursiva (Ctrl+I)">
            <em>I</em>
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleUnderline().run()}
              active={editor.isActive('underline')} title="Subrayado (Ctrl+U)">
            <span className="underline">U</span>
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleStrike().run()}
              active={editor.isActive('strike')} title="Tachado">
            <span className="line-through">S</span>
          </Btn>

          {sep}

          {/* Alineación */}
          <Btn onCmd={() => editor.chain().focus().setTextAlign('left').run()}
              active={editor.isActive({ textAlign: 'left' })} title="Alinear izquierda">
            ≡←
          </Btn>
          <Btn onCmd={() => editor.chain().focus().setTextAlign('center').run()}
              active={editor.isActive({ textAlign: 'center' })} title="Centrar">
            ≡
          </Btn>
          <Btn onCmd={() => editor.chain().focus().setTextAlign('right').run()}
              active={editor.isActive({ textAlign: 'right' })} title="Alinear derecha">
            ≡→
          </Btn>

          {sep}

          {/* Listas */}
          <Btn onCmd={() => editor.chain().focus().toggleBulletList().run()}
              active={editor.isActive('bulletList')} title="Lista con viñetas">
            • —
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleOrderedList().run()}
              active={editor.isActive('orderedList')} title="Lista numerada">
            1. —
          </Btn>

          {sep}

          {/* Cita / código */}
          <Btn onCmd={() => editor.chain().focus().toggleBlockquote().run()}
              active={editor.isActive('blockquote')} title="Cita">
            &ldquo;&rdquo;
          </Btn>
          <Btn onCmd={() => editor.chain().focus().toggleCode().run()}
              active={editor.isActive('code')} title="Código inline">
            {'</>'}
          </Btn>

          {sep}

          {/* Imagen */}
          <Btn onCmd={() => fileInputRef.current?.click()} title="Insertar imagen" active={uploading}>
            {uploading ? '⏳' : '🖼'}
          </Btn>

          {/* YouTube */}
          <Btn onCmd={() => setShowYt(v => !v)} active={showYt} title="Insertar video de YouTube">
            ▶ YT
          </Btn>

          {/* Deshacer / Rehacer */}
          <div className="ml-auto flex items-center gap-0.5">
            <Btn onCmd={() => editor.chain().focus().undo().run()} title="Deshacer (Ctrl+Z)">↩</Btn>
            <Btn onCmd={() => editor.chain().focus().redo().run()} title="Rehacer (Ctrl+Y)">↪</Btn>
          </div>
        </div>

        {/* YouTube input */}
        {showYt && (
          <div className="flex gap-2 items-center px-3 py-2 border-b border-gray-100 bg-gray-50">
            <input
              type="url"
              value={ytUrl}
              onChange={(e) => setYtUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="flex-1 px-3 py-1.5 rounded-lg border border-gray-200 text-sm outline-none focus:border-primary"
              onKeyDown={(e) => { if (e.key === 'Enter') insertYoutube(); }}
            />
            <button type="button" onClick={insertYoutube}
              className="bg-primary text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-primary-dark transition-colors">
              Insertar
            </button>
            <button type="button" onClick={() => setShowYt(false)} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
          </div>
        )}

        {/* Área de edición */}
        <EditorContent editor={editor} />
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) uploadImage(file);
          e.target.value = '';
        }}
      />
    </div>
  );
}
