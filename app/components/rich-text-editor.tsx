import { SimpleEditor, SimpleEditorProps } from "./tiptap-templates/simple/simple-editor";

export default function RichTextEditor(props: SimpleEditorProps) {
  return (
    <>
      <SimpleEditor {...props} />
    </>
  )
}