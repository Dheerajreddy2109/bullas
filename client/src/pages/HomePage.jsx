import ServerStatus from '../components/ServerStatus.jsx'
import styles from '../css/HomePage.module.css'

function HomePage() {
  return (
    <main className={styles.page}>
      <h1>Bullas</h1>
      <ServerStatus />
    </main>
  )
}

export default HomePage
