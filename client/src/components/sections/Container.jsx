import styles from '../../css/sections/Container.module.css'

// The one page column every section sits in, so left and right edges always line up.
function Container({ className = '', children }) {
  return <div className={`${styles.container} ${className}`}>{children}</div>
}

export default Container
