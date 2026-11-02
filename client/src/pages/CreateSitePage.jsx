import { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateSiteForm from '../components/CreateSiteForm.jsx'
import SiteCreatedNotice from '../components/SiteCreatedNotice.jsx'
import styles from '../css/CreateSitePage.module.css'

function CreateSitePage() {
  const [created, setCreated] = useState(null)

  return (
    <>
      <Link className={styles.back} to="/sites">
        Back to sites
      </Link>
      <h1 className={styles.title}>Create site</h1>
      {created ? <SiteCreatedNotice {...created} /> : <CreateSiteForm onCreated={setCreated} />}
    </>
  )
}

export default CreateSitePage
