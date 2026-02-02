"use client";

import React, { useState, useEffect, useRef } from "react";
import { Editor } from "react-draft-wysiwyg";
import { EditorState, convertToRaw } from "draft-js";
import draftToHtml from "draftjs-to-html";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";

interface RichTextEditorProps {
  onChange: (html: string, text: string) => void;
  placeholder?: string;
  className?: string;
}

// Wrapper component to handle mounting lifecycle
function EditorWrapper({ editorState, onEditorStateChange, toolbarConfig, placeholder }: any) {
  const [mounted, setMounted] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setMounted(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="h-64 bg-slate-50 dark:bg-slate-900 animate-pulse rounded-md" />;
  }

  return (
    <div ref={wrapperRef}>
      <Editor
        editorState={editorState}
        wrapperClassName="wrapper-class"
        editorClassName="editor-class min-h-[300px] px-4 py-2 bg-transparent text-slate-900 dark:text-slate-100"
        toolbarClassName="toolbar-class !bg-neutral-50 dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800 !mb-0"
        onEditorStateChange={onEditorStateChange}
        placeholder={placeholder}
        toolbar={toolbarConfig}
        toolbarOnFocus
      />
    </div>
  );
}

export function RichTextEditor({ onChange, placeholder, className }: RichTextEditorProps) {
  const [editorState, setEditorState] = useState<EditorState>(() => EditorState.createEmpty());
  const initialValue = useRef<NodeJS.Timeout>(null);
  const updateTimeoutRef = useRef<NodeJS.Timeout>(initialValue.current);

  // Update parent with a debounce
  useEffect(() => {
    if (!editorState || !onChange) return;

    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    updateTimeoutRef.current = setTimeout(() => {
      const contentState = editorState.getCurrentContent();
      const rawContentState = convertToRaw(contentState);
      const html = draftToHtml(rawContentState);
      const text = contentState.getPlainText();
      
      onChange(html, text);
    }, 200);

    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [editorState, onChange]);

  const onEditorStateChange = React.useCallback((newState: EditorState) => {
    setEditorState(newState);
  }, []);

  const toolbarConfig = React.useMemo(() => ({
    options: [
      "inline",
      "blockType",
      "fontSize",
      "fontFamily",
      "list",
      "textAlign",
      "colorPicker",
      "link",
      "emoji",
      "image",
      "remove",
      "history",
    ],
    inline: { 
      inDropdown: false,
      options: ['bold', 'italic', 'underline', 'strikethrough', 'monospace', 'superscript', 'subscript'],
    },
    blockType: {
      inDropdown: true,
      options: ['Normal', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'Blockquote', 'Code'],
    },
    fontSize: {
      inDropdown: true,
      options: [8, 9, 10, 11, 12, 14, 16, 18, 24, 30, 36, 48, 60, 72, 96],
    },
    fontFamily: {
      inDropdown: true,
      options: ['Arial', 'Georgia', 'Impact', 'Tahoma', 'Times New Roman', 'Verdana'],
    },
    list: { 
      inDropdown: false,
      options: ['unordered', 'ordered', 'indent', 'outdent'],
    },
    textAlign: { 
      inDropdown: false,
      options: ['left', 'center', 'right', 'justify'],
    },
    link: { 
      inDropdown: false,
      showOpenOptionOnHover: true,
      defaultTargetOption: "_blank",
      options: ['link', 'unlink'],
    },
    colorPicker: {
      className: undefined,
      component: undefined,
      popupClassName: "!bg-white dark:!bg-neutral-900 !border-neutral-200 dark:!border-neutral-800",
      colors: ['rgb(97,189,109)', 'rgb(26,188,156)', 'rgb(84,172,210)', 'rgb(44,130,201)',
        'rgb(147,101,184)', 'rgb(71,85,119)', 'rgb(204,204,204)', 'rgb(65,168,95)', 'rgb(0,168,133)',
        'rgb(61,142,185)', 'rgb(41,105,176)', 'rgb(85,57,130)', 'rgb(40,50,78)', 'rgb(0,0,0)',
        'rgb(247,218,100)', 'rgb(251,160,38)', 'rgb(235,107,86)', 'rgb(226,80,65)', 'rgb(163,143,132)',
        'rgb(239,239,239)', 'rgb(255,255,255)', 'rgb(250,197,28)', 'rgb(243,121,52)', 'rgb(209,72,65)',
        'rgb(184,49,47)', 'rgb(124,112,107)', 'rgb(209,213,216)'],
    },
    emoji: {
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      emojis: [
        '😀', '😁', '😂', '😃', '😉', '😋', '😎', '😍', '😗', '🤗', '🤔', '😣', '😫', '😴', '😌', '🤓',
        '😛', '😜', '😠', '😇', '😷', '😈', '👻', '😺', '😸', '😹', '😻', '😼', '😽', '🙀', '🙈',
        '🙉', '🙊', '👼', '👮', '🕵', '💂', '👳', '🎅', '👸', '👰', '👲', '🙍', '🙇', '🚶', '🏃', '💃',
        '⛷', '🏂', '🏌', '🏄', '🚣', '🏊', '⛹', '🏋', '🚴', '👫', '💪', '👈', '👉', '👆', '🖕',
        '👇', '🖖', '🤘', '🖐', '👌', '👍', '👎', '✊', '👊', '👏', '🙌', '🙏', '🐵', '🐶', '🐇', '🐥',
        '🐸', '🐌', '🐛', '🐜', '🐝', '🍉', '🍄', '🍔', '🍤', '🍨', '🍪', '🎂', '🍰', '🍾', '🍷', '🍸',
        '🍺', '🌍', '🚑', '⏰', '🌙', '🌝', '🌞', '⭐', '🌟', '🌠', '🌨', '🌩', '⛄', '🔥', '🎄', '🎈',
        '🎉', '🎊', '🎁', '🎗', '🏀', '🏈', '🎲', '🔇', '🔈', '📣', '🔔', '🎵', '🎷', '💰', '🖊', '📅',
        '✅', '❎', '💯',
      ],
    },
    image: { 
      className: undefined,
      component: undefined,
      popupClassName: undefined,
      urlEnabled: true,
      uploadEnabled: true,
      alignmentEnabled: true,
      uploadCallback: (file: File) => {
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve({ data: { link: e.target?.result } });
          reader.onerror = (e) => reject(e);
          reader.readAsDataURL(file);
        });
      },
      previewImage: true,
      inputAccept: 'image/gif,image/jpeg,image/jpg,image/png,image/svg',
      alt: { present: false, mandatory: false },
      defaultSize: {
        height: 'auto',
        width: 'auto',
      },
    },
    remove: { className: undefined, component: undefined },
    history: { 
      inDropdown: false,
      className: undefined,
      component: undefined,
      options: ['undo', 'redo'],
    },
  }), []);

  return (
    <div className={`rich-text-editor-wrapper ${className || ''}`}>
      <EditorWrapper
        editorState={editorState}
        onEditorStateChange={onEditorStateChange}
        toolbarConfig={toolbarConfig}
        placeholder={placeholder}
      />

      {/* Custom styles */}
      <style jsx global>{`
        /* Fix Tailwind Preflight resetting List Styles */
        .public-DraftStyleDefault-ul, .public-DraftStyleDefault-ol {
           margin: 1em 0;
           padding-left: 1.5em;
        }
        .public-DraftStyleDefault-ul {
           list-style-type: disc !important;
        }
        .public-DraftStyleDefault-ol {
           list-style-type: decimal !important;
        }
        
        /* Fix Subscript/Superscript */
        sub {
           vertical-align: sub;
           font-size: smaller;
           position: static;
        }
        sup {
           vertical-align: super;
           font-size: smaller;
           position: static;
        }

        /* Editor Container Styling */
        .rich-text-editor-wrapper {
           display: flex;
           flex-direction: column;
           border: 1px solid #e5e7eb;
           border-radius: 0.5rem;
           overflow: hidden;
        }
        .dark .rich-text-editor-wrapper {
           border: 1px solid #262626;
        }
        .rich-text-editor-wrapper .rdw-editor-toolbar {
          border-bottom: 1px solid #e5e7eb;
        }
        .dark .rich-text-editor-wrapper .rdw-editor-toolbar {
          border-bottom: 1px solid #262626;
        }
        
        /* Allow editor content to scroll */
        .editor-class {
            overflow-y: auto;
            max-height: 500px;
        }

        /* Toolbar sections */
        .rdw-inline-wrapper,
        .rdw-block-wrapper,
        .rdw-fontsize-wrapper,
        .rdw-fontfamily-wrapper,
        .rdw-list-wrapper,
        .rdw-text-align-wrapper,
        .rdw-colorpicker-wrapper,
        .rdw-link-wrapper,
        .rdw-emoji-wrapper,
        .rdw-image-wrapper,
        .rdw-remove-wrapper,
        .rdw-history-wrapper {
          display: flex;
          align-items: center;
          margin-bottom: 0;
          flex-wrap: nowrap;
        }

        /* Options */
        .rdw-option-wrapper {
          background-color: transparent;
          border: none;
          box-shadow: none;
          min-width: 25px;
          height: 25px;
          padding: 5px;
          margin: 0 2px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .rdw-option-wrapper:hover {
          background-color: rgba(0, 0, 0, 0.05);
          box-shadow: none;
        }
        .dark .rdw-option-wrapper:hover {
          background-color: rgba(255, 255, 255, 0.1);
        }
        .dark .rdw-option-wrapper {
           color: #f3f4f6;
        }
        .rdw-option-active {
           background-color: rgba(0, 0, 0, 0.1);
        }
        .dark .rdw-option-active {
           background-color: rgba(255, 255, 255, 0.1);
           border: 1px solid #1e293b;
        }
        .rdw-option-disabled {
           opacity: 0.3;
           cursor: not-allowed;
        }

        /* Dropdowns */
        .rdw-dropdown-wrapper {
          box-shadow: none;
          background-color: white;
          border: 1px solid #e5e7eb;
          margin-bottom: 0;
          height: 30px;
          border-radius: 4px;
          cursor: pointer;
        }
        .dark .rdw-dropdown-wrapper {
           background-color: #0f172a;
           border: 1px solid #1e293b;
           color: #f3f4f6;
        }
        .rdw-dropdown-optionwrapper {
            background-color: white;
            border: 1px solid #e5e7eb;
            z-index: 100;
            max-height: 200px;
            overflow-y: auto;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            border-radius: 4px;
        }
        .dark .rdw-dropdown-optionwrapper {
           background-color: #0f172a;
           border: 1px solid #1e293b;
           color: #f3f4f6;
        }
        .rdw-dropdownoption-default {
            padding: 8px 12px;
            cursor: pointer;
        }
        .rdw-dropdownoption-default:hover {
            background-color: #f3f4f6;
        }
        .dark .rdw-dropdownoption-default:hover {
            background-color: #1e293b;
        }
        .rdw-dropdownoption-active {
            background-color: #e5e7eb;
        }
        .dark .rdw-dropdownoption-active {
            background-color: #1e293b;
        }
        .rdw-dropdown-selectedtext {
            color: inherit;
            display: flex;
            align-items: center;
            padding: 0 8px;
        }
        .rdw-dropdown-carettoopen,
        .rdw-dropdown-carettoclose {
            margin-left: 4px;
        }
        .dark .rdw-dropdown-carettoopen {
            border-top-color: #f3f4f6;
        }
        .dark .rdw-dropdown-carettoclose {
            border-bottom-color: #f3f4f6;
        }

        /* Color Picker */
        .rdw-colorpicker-modal {
           box-shadow: 0 2px 8px rgba(0,0,0,0.15);
           border: 1px solid #e5e7eb;
           background-color: white;
           z-index: 100;
           border-radius: 4px;
        }
        .dark .rdw-colorpicker-modal {
           background-color: #0f172a;
           border: 1px solid #1e293b;
        }
        .rdw-colorpicker-option {
           border: 1px solid #e5e7eb;
           cursor: pointer;
        }
        .dark .rdw-colorpicker-option {
           border: 1px solid #1e293b;
        }

        /* Emoji Picker */
        .rdw-emoji-modal {
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
            background-color: white;
            z-index: 100;
            border-radius: 4px;
            padding: 8px;
        }
        .dark .rdw-emoji-modal {
            background-color: #0f172a;
            border: 1px solid #1e293b;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        }
        .rdw-emoji-icon {
            cursor: pointer;
            padding: 4px;
            border-radius: 2px;
        }
        .rdw-emoji-icon:hover {
            background-color: #f3f4f6;
        }
        .dark .rdw-emoji-icon:hover {
            background-color: #1e293b;
        }

        /* Modals (Link, Image) */
        .rdw-link-modal, .rdw-image-modal, .rdw-embedded-modal {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          border: 1px solid #e5e7eb;
          left: 50%;
          transform: translateX(-50%);
          z-index: 100;
          background-color: white;
          border-radius: 4px;
          padding: 16px;
        }
        .dark .rdw-link-modal, .dark .rdw-image-modal, .dark .rdw-embedded-modal {
          background-color: #0f172a;
          border: 1px solid #1e293b;
          color: #f3f4f6;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5);
        }
        .rdw-link-modal-label, .rdw-image-modal-label {
           color: #374151;
           font-weight: 500;
           margin-bottom: 4px;
        }
        .dark .rdw-link-modal-label, .dark .rdw-image-modal-label {
           color: #e5e7eb;
        }
        .rdw-link-modal-input, .rdw-image-modal-input {
           background-color: white;
           border: 1px solid #d1d5db;
           color: #111827;
           padding: 8px;
           border-radius: 4px;
           width: 100%;
        }
        .dark .rdw-link-modal-input, .dark .rdw-image-modal-input {
           background-color: #1e293b;
           border: 1px solid #334155;
           color: #fff;
        }
        .rdw-link-modal-btn, .rdw-image-modal-btn {
           background-color: #f3f4f6;
           border: 1px solid #d1d5db;
           color: #374151;
           padding: 8px 16px;
           border-radius: 4px;
           cursor: pointer;
           font-weight: 500;
        }
        .rdw-link-modal-btn:hover, .rdw-image-modal-btn:hover {
           background-color: #e5e7eb;
        }
        .dark .rdw-link-modal-btn, .dark .rdw-image-modal-btn {
           background-color: #334155;
           border: 1px solid #475569;
           color: #fff;
        }
        .dark .rdw-link-modal-btn:hover, .dark .rdw-image-modal-btn:hover {
           background-color: #475569;
        }
        .rdw-link-modal-btn:disabled, .rdw-image-modal-btn:disabled {
           opacity: 0.5;
           cursor: not-allowed;
        }
        .dark .rdw-link-modal-btn:disabled, .dark .rdw-image-modal-btn:disabled {
           background-color: #1e293b;
        }
      `}</style>
    </div>
  );
}

export default RichTextEditor;