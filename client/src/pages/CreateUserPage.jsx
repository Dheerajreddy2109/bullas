import { useState } from 'react'
import Breadcrumbs from '../components/Breadcrumbs.jsx'
import CreateUserForm from '../components/users/CreateUserForm.jsx'
import UserCreatedNotice from '../components/users/UserCreatedNotice.jsx'
import styles from '../css/CreateSitePage.module.css'

function CreateUserPage() {
  const [created, setCreated] = useState(null)

  return (
    <>
      <Breadcrumbs
        items={[{ label: 'Dashboard', to: '/' }, { label: 'Users', to: '/users' }, { label: 'Add builder' }]}
      />
      <h1 className={styles.title}>Add builder</h1>
      {created ? <UserCreatedNotice {...created} /> : <CreateUserForm onCreated={setCreated} />}
    </>
  )
}

export default CreateUserPage
