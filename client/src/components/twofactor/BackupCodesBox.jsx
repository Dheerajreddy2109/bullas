import { useState } from 'react'
import styles from '../../css/twofactor/BackupCodesBox.module.css'

// Shown once, straight after turning 2FA on; the server only keeps their hashes.
function BackupCodesBox({ codes, onDone }) {
  const [copied, setCopied] = useState(false)
  const text = `Bullas backup codes. Each works once.\n\n${codes.join('\n')}\n`

  async function copy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
  }

  function download() {
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'bullas-backup-codes.txt'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={styles.box}>
      <h2 className={styles.title}>Two-factor login is on</h2>
      <p className={styles.warning}>
        Save these backup codes somewhere safe, like a password manager. Each works once, if you lose your phone.
        They won't be shown again.
      </p>
      <ol className={styles.codes}>
        {codes.map((code) => (
          <li key={code}>{code}</li>
        ))}
      </ol>
      <div className={styles.actions}>
        <button className={styles.secondary} type="button" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button className={styles.secondary} type="button" onClick={download}>
          Download
        </button>
        <button className={styles.primary} type="button" onClick={onDone}>
          I've saved them
        </button>
      </div>
    </div>
  )
}

export default BackupCodesBox
