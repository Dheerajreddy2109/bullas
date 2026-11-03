import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import DnsInstructions from '../components/domain/DnsInstructions.jsx'
import DomainForm from '../components/domain/DomainForm.jsx'
import DomainStatus from '../components/domain/DomainStatus.jsx'
import { getSiteDomain, removeSiteDomain, saveSiteDomain, verifySiteDomain } from '../services/api.js'
import styles from '../css/DomainPage.module.css'

function DomainPage() {
  const { id } = useParams()
  const [domain, setDomain] = useState(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    getSiteDomain(id)
      .then(setDomain)
      .catch((err) => setError(err.message))
  }, [id])

  async function run(action) {
    setError('')
    setBusy(true)
    try {
      setDomain(await action())
    } catch (err) {
      setError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (!domain && !error) return <p>Loading...</p>

  return (
    <>
      <Link className={styles.back} to="/sites">
        Back to sites
      </Link>
      <h1 className={styles.title}>Custom domain</h1>
      {domain && (
        <p className={styles.intro}>
          This site always works at <strong>{domain.subdomainAddress}</strong>. A custom domain is optional.
        </p>
      )}
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      {domain && (
        <div className={styles.stack}>
          {/* The key resets the form's text after a save or removal. */}
          <DomainForm
            key={domain.customDomain}
            currentDomain={domain.customDomain}
            busy={busy}
            onSave={(value) => run(() => saveSiteDomain(id, value))}
            onRemove={() => run(() => removeSiteDomain(id))}
          />
          <DomainStatus
            domain={domain.customDomain}
            status={domain.domainStatus}
            message={domain.domainMessage}
            checkedAt={domain.domainCheckedAt}
            busy={busy}
            onVerify={() => run(() => verifySiteDomain(id))}
          />
          <DnsInstructions domain={domain.customDomain} cnameTarget={domain.cnameTarget} serverIp={domain.serverIp} />
        </div>
      )}
    </>
  )
}

export default DomainPage
