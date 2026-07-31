import { useEditor, EditorContent } from '@tiptap/react';

import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Placeholder from '@tiptap/extension-placeholder';
import Youtube from '@tiptap/extension-youtube';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  List, ListOrdered, AlignLeft, AlignCenter, AlignRight,
  Link as LinkIcon, Image as ImageIcon, Quote, Heading1, Heading2, Heading3,
  Undo, Redo, Type, Video, Upload, Loader2
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  isActive = false,
  children,
  title,
  disabled = false,
}: {
  onClick: () => void;
  isActive?: boolean;
  children: React.ReactNode;
  title: string;
  disabled?: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    disabled={disabled}
    className={`h-7 w-7 rounded flex items-center justify-center transition-colors ${
      disabled ? 'opacity-50 cursor-not-allowed' :
      isActive
        ? 'bg-primary/10 text-primary'
        : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
    }`}
  >
    {children}
  </button>
);

const Divider = () => <div className="h-4 w-px bg-border mx-1" />;

const RichTextEditor = ({ content, onChange, placeholder }: RichTextEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: 'text-primary underline cursor-pointer' },
      }),
      Image.configure({
        HTMLAttributes: { class: 'max-w-full rounded-lg my-2' },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Placeholder.configure({
        placeholder: placeholder || 'Commencez à écrire...',
      }),
      Youtube.configure({
        HTMLAttributes: {
          class: 'rounded-lg my-4 w-full',
        },
        width: 640,
        height: 360,
        nocookie: true,
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'tiptap min-h-[200px] p-3 focus:outline-none',
      },
      handlePaste: (view, event) => {
        const text = event.clipboardData?.getData('text/plain');
        const htmlClip = event.clipboardData?.getData('text/html');

        // 1) If user pasted RAW HTML as plain text (e.g. from ChatGPT code block),
        // detect tags and inject as real HTML instead of escaped text.
        if (text && !htmlClip && /<\/?[a-z][a-z0-9]*[\s>]/i.test(text)) {
          event.preventDefault();
          const decoded = decodeHtmlIfEscaped(text);
          // Use ProseMirror's native DOMParser via the schema's contentMatch
          const tmp = document.createElement('div');
          tmp.innerHTML = decoded;
          // Fallback: insert as HTML through tiptap chain
          queueMicrotask(() => {
            editor?.chain().focus().insertContent(decoded).run();
          });
          return true;
        }

        if (text && isVideoUrl(text)) {
          event.preventDefault();
          const ytMatch = extractYoutubeId(text);
          if (ytMatch) {
            view.dispatch(view.state.tr.replaceSelectionWith(
              view.state.schema.nodes.youtube.create({ src: text, width: 640, height: 360 })
            ));
            return true;
          }
          const embedUrl = getVideoEmbedUrl(text);
          if (embedUrl) {
            const { tr } = view.state;
            const node = view.state.schema.nodes.paragraph.create(
              {},
              view.state.schema.text(text, [view.state.schema.marks.link.create({ href: text })])
            );
            view.dispatch(tr.replaceSelectionWith(node));
            return true;
          }
        }
        return false;
      },
    },
  });

  useEffect(() => {
    if (editor) {
      const normalized = decodeHtmlIfEscaped(content || '');
      if (normalized !== editor.getHTML()) {
        editor.commands.setContent(normalized, false as any);
        // If we auto-decoded escaped HTML, propagate the cleaned version up
        if (normalized !== content) {
          onChange(editor.getHTML());
        }
      }
    }
  }, [content, editor]);

  const addLink = useCallback(() => {
    if (!editor) return;
    const url = window.prompt('URL du lien:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  }, [editor]);

  const addImageByUrl = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de l'image:");
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  }, [editor]);

  const handleImageUpload = useCallback(async (file: File) => {
    if (!editor) return;
    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner une image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5 Mo");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Vous devez être connecté pour uploader");
        setUploading(false);
        return;
      }
      const ext = file.name.split('.').pop() || 'png';
      const fileName = `description-images/${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('product-assets')
        .upload(fileName, file, { contentType: file.type });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('product-assets')
        .getPublicUrl(fileName);

      editor.chain().focus().setImage({ src: urlData.publicUrl }).run();
      toast.success("Image ajoutée !");
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error("Erreur lors de l'upload: " + (err.message || "Réessayez"));
    } finally {
      setUploading(false);
    }
  }, [editor]);

  const onFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageUpload(file);
    e.target.value = '';
  }, [handleImageUpload]);

  const addVideo = useCallback(() => {
    if (!editor) return;
    const url = window.prompt("URL de la vidéo (YouTube, Vimeo, etc.):");
    if (!url) return;
    
    if (isYoutubeUrl(url)) {
      editor.commands.setYoutubeVideo({ src: url, width: 640, height: 360 });
    } else {
      editor.chain().focus().insertContent(
        `<p><a href="${url}" target="_blank">${url}</a></p>`
      ).run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="border border-input rounded-md overflow-hidden">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onFileSelect}
      />
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 p-2 bg-secondary/50 border-b border-input flex-wrap">
        <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Annuler">
          <Undo className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Rétablir">
          <Redo className="h-3.5 w-3.5" />
        </MenuButton>

        <Divider />

        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          isActive={editor.isActive('paragraph') && !editor.isActive('heading')}
          title="Paragraphe"
        >
          <Type className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Titre 1"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Titre 2"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Titre 3"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </MenuButton>

        <Divider />

        <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} isActive={editor.isActive('bold')} title="Gras">
          <Bold className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} isActive={editor.isActive('italic')} title="Italique">
          <Italic className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} isActive={editor.isActive('underline')} title="Souligné">
          <UnderlineIcon className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} isActive={editor.isActive('strike')} title="Barré">
          <Strikethrough className="h-3.5 w-3.5" />
        </MenuButton>

        <Divider />

        <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} isActive={editor.isActive({ textAlign: 'left' })} title="Aligner à gauche">
          <AlignLeft className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} isActive={editor.isActive({ textAlign: 'center' })} title="Centrer">
          <AlignCenter className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} isActive={editor.isActive({ textAlign: 'right' })} title="Aligner à droite">
          <AlignRight className="h-3.5 w-3.5" />
        </MenuButton>

        <Divider />

        <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} isActive={editor.isActive('bulletList')} title="Liste à puces">
          <List className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} isActive={editor.isActive('orderedList')} title="Liste numérotée">
          <ListOrdered className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} isActive={editor.isActive('blockquote')} title="Citation">
          <Quote className="h-3.5 w-3.5" />
        </MenuButton>

        <Divider />

        <MenuButton onClick={addLink} isActive={editor.isActive('link')} title="Ajouter un lien">
          <LinkIcon className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={() => fileInputRef.current?.click()} title="Uploader une image" disabled={uploading}>
          {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />}
        </MenuButton>
        <MenuButton onClick={addImageByUrl} title="Image par URL">
          <ImageIcon className="h-3.5 w-3.5" />
        </MenuButton>
        <MenuButton onClick={addVideo} title="Insérer une vidéo">
          <Video className="h-3.5 w-3.5" />
        </MenuButton>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
};

// Helpers
function isYoutubeUrl(url: string): boolean {
  return /(?:youtube\.com\/(?:watch|embed|shorts)|youtu\.be)/i.test(url);
}

function isVideoUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be|vimeo\.com|dailymotion\.com)/i.test(url);
}

function extractYoutubeId(url: string): string | null {
  const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]+)/);
  return m ? m[1] : null;
}

function getVideoEmbedUrl(url: string): string | null {
  const ytId = extractYoutubeId(url);
  if (ytId) return `https://www.youtube-nocookie.com/embed/${ytId}`;
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

/**
 * Detects HTML that was stored as escaped text (e.g. "&lt;h1&gt;Hello&lt;/h1&gt;"
 * or even raw "<h1>Hello</h1>" pasted as plain text into a text node) and
 * returns proper HTML so it can be rendered or re-loaded into TipTap.
 */
export function decodeHtmlIfEscaped(input: string): string {
  if (!input) return input;
  let html = input;

  // Case 1: HTML entities encoding tags — &lt;h1&gt; ... &lt;/h1&gt;
  if (/&lt;\/?[a-z][a-z0-9]*[^&]*&gt;/i.test(html)) {
    html = html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }

  // Case 2: raw HTML stored inside <p> wrappers as text (TipTap behavior on plain paste)
  // e.g. "<p>&lt;h1&gt;Title&lt;/h1&gt;</p>" -> already handled above
  // e.g. "<p><h1>Title</h1></p>" — strip nested block tags trapped inside <p>
  if (/<p>\s*<(h[1-6]|div|section|article|ul|ol|table|hr|img)/i.test(html)) {
    html = html.replace(/<p>(\s*<(h[1-6]|div|section|article|ul|ol|table|hr|img)[\s\S]*?)<\/p>/gi, '$1');
  }

  return html;
}

export function processDescriptionWithVideos(html: string): string {
  if (!html) return html;
  html = decodeHtmlIfEscaped(html);

  let processed = html.replace(
    /<a[^>]*href="(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)[^"]*)"[^>]*>[^<]*<\/a>/gi,
    (_match, _url, videoId) => {
      return `<div class="video-embed my-4"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full rounded-lg" style="aspect-ratio:16/9;"></iframe></div>`;
    }
  );

  processed = processed.replace(
    /<a[^>]*href="(https?:\/\/(?:www\.)?vimeo\.com\/(\d+)[^"]*)"[^>]*>[^<]*<\/a>/gi,
    (_match, _url, videoId) => {
      return `<div class="video-embed my-4"><iframe src="https://player.vimeo.com/video/${videoId}" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen class="w-full rounded-lg" style="aspect-ratio:16/9;"></iframe></div>`;
    }
  );

  processed = processed.replace(
    /(?<![">])(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/shorts\/)([\w-]+)[^\s<]*)/gi,
    (_match, _url, videoId) => {
      return `<div class="video-embed my-4"><iframe src="https://www.youtube-nocookie.com/embed/${videoId}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen class="w-full rounded-lg" style="aspect-ratio:16/9;"></iframe></div>`;
    }
  );

  return processed;
}

export default RichTextEditor;
