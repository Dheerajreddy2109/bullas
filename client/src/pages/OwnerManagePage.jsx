import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import OwnerResetForm from '../components/OwnerResetForm.jsx'
import OwnerStatusCard from '../components/OwnerStatusCard.jsx'
import TwoFactorResetCard from '../components/twofactor/TwoFactorResetCard.jsx'
import { getSiteOwner, resetOwnerPassword, resetOwnerTwoFactor, setOwnerDisabled } from '../services/api.js'
import styles from '../css/OwnerManagePage.module.css'

function OwnerManagePage() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    getSiteOwner(id)
      .then(setData)
      .catch((err) => setError(err.message))
  }, [id])

  const updateOwner = (owner) => setData((current) => ({ ...current, owner }))

  return (
    <>
      <Link className={styles.back} to="/sites">
        Back to sites
      </Link>
      <h1 className={styles.title}>Manage owner{data && `: ${data.site.name}`}</h1>
      {error && <p role="alert">Could not load the owner: {error}</p>}
      {!data && !error && <p>Loading...</p>}
      {data && (
        <div className={styles.columns}>
          <OwnerStatusCard
            owner={data.owner}
            setDisabled={(disabled) => setOwnerDisabled(id, disabled)}
            onChange={updateOwner}
          />
          <OwnerResetForm resetPassword={(password) => resetOwnerPassword(id, password)} onReset={updateOwner} />
          <TwoFactorResetCard
            enabled={data.owner.twoFactorEnabled}
            reset={() => resetOwnerTwoFactor(id)}
            onReset={() => updateOwner({ ...data.owner, twoFactorEnabled: false })}
          />
        </div>
      )}
    </>
  )
}

export default OwnerManagePage
