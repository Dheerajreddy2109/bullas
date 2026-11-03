import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import SitesTable from '../components/SitesTable.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { assignSiteBuilder, getSites, listUsers, updateSiteStatus } from '../services/api.js'
import styles from '../css/SitesPage.module.css'

function SitesPage() {
  const { user } = useAuth()
  const isSuperAdmin = user.role === 'superadmin'
  const [sites, setSites] = useState(null)
  const [builders, setBuilders] = useState([])
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  useEffect(() => {
    getSites()
      .then(setSites)
      .catch((err) => setError(err.message))
    // Builders can't list users, so the request is only made for the super admin.
    if (isSuperAdmin) {
      listUsers()
        .then(setBuilders)
        .catch((err) => setError(err.message))
    }
  }, [isSuperAdmin])

  async function runForSite(site, action) {
    setError('')
    setBusyId(site._id)
    try {
      await action()
      setSites(await getSites())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusyId(null)
    }
  }

  const handleToggleStatus = (site) =>
    runForSite(site, () => updateSiteStatus(site._id, site.status === 'published' ? 'draft' : 'published'))
  const handleAssign = (site, builderId) => runForSite(site, () => assignSiteBuilder(site._id, builderId))

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>{isSuperAdmin ? 'Sites' : 'My sites'}</h1>
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
        <SitesTable
          sites={sites}
          busyId={busyId}
          onToggleStatus={handleToggleStatus}
          isSuperAdmin={isSuperAdmin}
          builders={builders}
          onAssign={handleAssign}
        />
      )}
    </>
  )
}

export default SitesPage
