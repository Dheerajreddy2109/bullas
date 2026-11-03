import { Link } from 'react-router-dom'
import styles from '../../css/users/UsersTable.module.css'

function UsersTable({ users }) {
  return (
    // Scrolls inside its own box, so a wide table can't push a phone screen sideways.
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Sites</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.siteCount}</td>
              <td>
                <span className={user.disabled ? styles.disabled : styles.active}>
                  {user.disabled ? 'Disabled' : 'Active'}
                </span>
                {user.mustChangePassword && <span className={styles.pending}> Temporary password</span>}
              </td>
              <td>
                <Link className={styles.button} to={`/users/${user._id}`}>
                  Manage
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersTable
