import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SitesTable from '../components/SitesTable.jsx'
import { getSites, updateSiteStatus } from '../services/api.js'
import styles from '../css/SitesPage.module.css'

function SitesPage() {
  const [sites, setSites] = useState(null)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err) => setError(err.message))
  }, [])

  async function handleToggleStatus(site) {
    setError('')
    setBusyId(site._id)
    try {
      const nextStatus = site.status === 'published' ? 'draft' : 'published'
      const updated = await updateSiteStatus(site._id, nextStatus)
      setSites((current) =>
        current.map((item) => (item._id === site._id ? { ...item, status: updated.status } : item)),
      )
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Sites</h1>
        <Link className={styles.button} to="/sites/new">
          Create site
        </Link>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {!error && !sites && <p>Loading...</p>}
      {sites?.length === 0 && <p>No sites yet. Create your first one.</p>}
      {sites?.length > 0 && (
        <SitesTable sites={sites} busyId={busyId} onToggleStatus={handleToggleStatus} />
      )}
    </>
  )
}

export default SitesPage
