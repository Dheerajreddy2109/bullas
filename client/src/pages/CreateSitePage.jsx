import { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import CreateSiteForm from '../components/CreateSiteForm.jsx'
import SiteCreatedNotice from '../components/SiteCreatedNotice.jsx'
import styles from '../css/CreateSitePage.module.css'

function CreateSitePage() {
  const [created, setCreated] = useState(null)

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Dashboard', to: '/' }, { label: 'Sites', to: '/sites' }, { label: 'Create site' }]}
      />
      <h1 className={styles.title}>Create site</h1>
      {created ? <SiteCreatedNotice {...created} /> : <CreateSiteForm onCreated={setCreated} />}
    </>
  )
}

export default CreateSitePage
