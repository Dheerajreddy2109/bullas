// A preview button. It opens in a new tab, so the page being edited stays open behind it.
// noopener stops the new tab from controlling this one. A plain link is used on purpose:
// the app's own Link can only move within the current tab.
function ScopeLink({ to, className, children }) {
  return (
    <a className={className} href={to} target="_blank" rel="noopener noreferrer">
      {children}
    </a>
  )
}

export default ScopeLink
