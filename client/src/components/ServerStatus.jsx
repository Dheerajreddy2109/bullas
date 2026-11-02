import { useEffect, useState } from 'react'
import { getServerHealth } from '../services/api.js'
import styles from '../css/ServerStatus.module.css'

function ServerStatus() {
  const [status, setStatus] = useState('checking...')

  // In an effect so the request runs once after render, not on every re-render.
  useEffect(() => {
    getServerHealth()
      .then((data) => setStatus(data.status))
      .catch((err) => setStatus(`could not reach the server (${err.message})`))
  }, [])

  return <p className={styles.status}>Server status: {status}</p>
}

export default ServerStatus
