import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import UsersTable from '../components/users/UsersTable.jsx'
import { listUsers } from '../services/api.js'
import styles from '../css/UsersPage.module.css'

function UsersPage() {
  const [users, setUsers] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => setError(err.message))
  }, [])

  return (
    <>
      <div className={styles.header}>
        <h1 className={styles.title}>Builders</h1>
        <Link className={styles.button} to="/users/new">
          Add builder
        </Link>
      </div>
      <p className={styles.intro}>Builders log in here and create and edit only the sites assigned to them.</p>
      {error && <p role="alert">Could not load users: {error}</p>}
      {!users && !error && <p>Loading...</p>}
      {users?.length === 0 && <p>No builders yet.</p>}
      {users?.length > 0 && <UsersTable users={users} />}
    </>
  )
}

export default UsersPage
