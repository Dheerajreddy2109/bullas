import { useState } from 'react'
import { Link } from 'react-router-dom'
import CreateUserForm from '../components/users/CreateUserForm.jsx'
import UserCreatedNotice from '../components/users/UserCreatedNotice.jsx'
import styles from '../css/CreateSitePage.module.css'

function CreateUserPage() {
  const [created, setCreated] = useState(null)

  return (
    <>
      <Link className={styles.back} to="/users">
        Back to users
      </Link>
      <h1 className={styles.title}>Add builder</h1>
      {created ? <UserCreatedNotice {...created} /> : <CreateUserForm onCreated={setCreated} />}
    </>
  )
}

export default CreateUserPage
