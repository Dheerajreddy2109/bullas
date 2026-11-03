import { Link } from 'react-router-dom'

// A normal link inside the app, or a new tab when it leads to the live site outside the admin area.
function ScopeLink({ to, external = false, className, children }) {
  if (external) {
    return (
      <a className={className} href={to} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  }
  return (
    <Link className={className} to={to}>
      {children}
    </Link>
  )
}

export default ScopeLink
