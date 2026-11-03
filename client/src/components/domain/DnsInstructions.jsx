import styles from '../../css/domain/DnsInstructions.module.css'

// Read-only, because these values come from the server's settings, not from this form.
function DnsInstructions({ domain, cnameTarget, serverIp }) {
  const name = domain || 'yourdomain.com'

  return (
    <div className={styles.box}>
      <h2 className={styles.title}>DNS records the owner must add</h2>
      <p className={styles.text}>
        At the company where {name} was bought (such as GoDaddy or Hostinger), add these records:
      </p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Name / Host</th>
              <th>Points to</th>
              <th>For</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CNAME</td>
              <td>www</td>
              <td>
                <input className={styles.value} readOnly value={cnameTarget} aria-label="CNAME target" />
              </td>
              <td>www.{name}</td>
            </tr>
            <tr>
              <td>A</td>
              <td>@</td>
              <td>
                <input
                  className={styles.value}
                  readOnly
                  value={serverIp || 'Set SERVER_IP in the server .env'}
                  aria-label="Server IP address"
                />
              </td>
              <td>{name}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p className={styles.note}>
        The main domain ({name}) uses an A record because DNS doesn't allow a CNAME there; it must sit beside
        email and other records. Some providers offer an ALIAS or ANAME record instead, which can point to{' '}
        {cnameTarget}. For a subdomain like shop.{name}, add a CNAME for "shop" to {cnameTarget} and enter
        shop.{name} above.
      </p>
    </div>
  )
}

export default DnsInstructions
