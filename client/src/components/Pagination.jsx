import styles from '../css/Pagination.module.css'

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.pagination} aria-label="Pages">
      <button className={styles.button} type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Previous
      </button>
      <span className={styles.status}>
        Page {page} of {totalPages}
      </span>
      <button
        className={styles.button}
        type="button"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </nav>
  )
}

export default Pagination
