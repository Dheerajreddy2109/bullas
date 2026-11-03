import { Link } from 'react-router-dom'
import styles from '../../css/users/UserCreatedNotice.module.css'

// The password only exists here because the form just held it; the server can't show it again.
function UserCreatedNotice({ user, temporaryPassword }) {
  return (
    <div className={styles.notice} role="status">
      <h2 className={styles.title}>Builder "{user.name}" was created</h2>
      <dl className={styles.details}>
        <dt>Login address</dt>
        <dd>{window.location.origin}</dd>
        <dt>Email</dt>
        <dd>{user.email}</dd>
        <dt>Temporary password</dt>
        <dd className={styles.password}>{temporaryPassword}</dd>
      </dl>
      <p className={styles.warning}>
        Copy this password now, because it won't be shown again. Send it privately, separately from the email address.
      </p>
      <Link className={styles.button} to="/users">
        Go to users
      </Link>
    </div>
  )
}

export default UserCreatedNotice
