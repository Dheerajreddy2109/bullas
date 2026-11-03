import { useEffect, useRef, useState } from 'react'
import styles from '../../css/blog/RichTextEditor.module.css'

const TOOLS = [
  { label: 'B', title: 'Bold', command: 'bold' },
  { label: 'I', title: 'Italic', command: 'italic' },
  { label: 'H2', title: 'Heading', command: 'formatBlock', value: 'h2' },
  { label: 'H3', title: 'Subheading', command: 'formatBlock', value: 'h3' },
  { label: '¶', title: 'Paragraph', command: 'formatBlock', value: 'p' },
  { label: '• List', title: 'Bulleted list', command: 'insertUnorderedList' },
  { label: '1. List', title: 'Numbered list', command: 'insertOrderedList' },
]

// execCommand is marked outdated but still works in every browser, needs no package,
// and the server cleans the HTML anyway. A full editor library can replace this later.
function RichTextEditor({ initialHtml, resetKey, onChange }) {
  const editorRef = useRef(null)
  const savedRange = useRef(null)
  const [linkOpen, setLinkOpen] = useState(false)
  const [linkUrl, setLinkUrl] = useState('')
  const [linkError, setLinkError] = useState('')

  // Set only when the post changes, because rewriting while typing would move the cursor.
  // The HTML comes from our server, which has already cleaned it.
  useEffect(() => {
    editorRef.current.innerHTML = initialHtml ?? ''
  }, [resetKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function run(command, value) {
    editorRef.current.focus()
    document.execCommand(command, false, value)
    onChange(editorRef.current.innerHTML)
  }

  function openLink() {
    const selection = window.getSelection()
    // Remembered because typing the URL moves focus away and loses the selected words.
    if (selection.rangeCount && editorRef.current.contains(selection.anchorNode)) {
      savedRange.current = selection.getRangeAt(0).cloneRange()
    }
    setLinkUrl('https://')
    setLinkError('')
    setLinkOpen(true)
  }

  function applyLink() {
    if (!/^(https?:\/\/[^\s]+|mailto:[^\s]+)$/i.test(linkUrl)) {
      setLinkError('Use a full address starting with https:// or mailto:')
      return
    }
    if (savedRange.current) {
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(savedRange.current)
    }
    run('createLink', linkUrl)
    setLinkOpen(false)
  }

  // Pastes plain text, so formatting copied from other sites doesn't come along.
  function handlePaste(event) {
    event.preventDefault()
    document.execCommand('insertText', false, event.clipboardData.getData('text/plain'))
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar} role="toolbar" aria-label="Formatting">
        {TOOLS.map((tool) => (
          <button
            key={tool.title}
            className={styles.tool}
            type="button"
            title={tool.title}
            // preventDefault on mousedown keeps the text selection while clicking.
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => run(tool.command, tool.value)}
          >
            {tool.label}
          </button>
        ))}
        <button
          className={styles.tool}
          type="button"
          title="Link"
          onMouseDown={(event) => event.preventDefault()}
          onClick={openLink}
        >
          Link
        </button>
      </div>
      {linkOpen && (
        <div className={styles.linkRow}>
          <input
            className={styles.linkInput}
            value={linkUrl}
            aria-label="Link address"
            onChange={(event) => setLinkUrl(event.target.value)}
          />
          <button className={styles.tool} type="button" onClick={applyLink}>
            Add link
          </button>
          <button className={styles.tool} type="button" onClick={() => setLinkOpen(false)}>
            Cancel
          </button>
          {linkError && <p className={styles.error}>{linkError}</p>}
        </div>
      )}
      <div
        ref={editorRef}
        className={styles.editor}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        aria-label="Post body"
        onInput={() => onChange(editorRef.current.innerHTML)}
        onPaste={handlePaste}
      />
    </div>
  )
}

export default RichTextEditor
