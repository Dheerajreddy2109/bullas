import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import LoginLinks from '../components/LoginLinks.jsx'
import OwnerResetForm from '../components/OwnerResetForm.jsx'
import OwnerStatusCard from '../components/OwnerStatusCard.jsx'
import TwoFactorResetCard from '../components/twofactor/TwoFactorResetCard.jsx'
import { getSiteOwner, resetOwnerPassword, resetOwnerTwoFactor, setOwnerDisabled } from '../services/api.js'
import { siteAddress } from '../utils/siteAddress.js'
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
      <Breadcrumbs
        items={[
          { label: 'Dashboard', to: '/' },
          { label: 'Sites', to: '/sites' },
          { label: data?.site.name ?? 'Site', to: `/sites/${id}/edit` },
          { label: 'Owner' },
        ]}
      />
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
          <LoginLinks
            links={[
              { label: 'Website', url: siteAddress(data.site.subdomain) },
              { label: 'Owner login', url: siteAddress(data.site.subdomain, '/admin') },
            ]}
          />
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
