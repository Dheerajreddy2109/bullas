import { useEffect, useState } from 'react'

function App() {
  const [status, setStatus] = useState('checking...')

  // In an effect so the request runs once after render, not on every re-render.
  useEffect(() => {
    fetch('/api/health')
      .then((res) => {
        // fetch only rejects on network failure, so a 500 from the proxy must be caught here.
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => setStatus(data.status))
      .catch((err) => setStatus(`could not reach the server (${err.message})`))
  }, [])

  return (
    <main>
      <h1>Bullas</h1>
      <p>Server status: {status}</p>
    </main>
  )
}

export default App
