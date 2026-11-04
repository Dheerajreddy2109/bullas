import CardGrid from './CardGrid.jsx'
import InfoCard from './InfoCard.jsx'
import styles from '../../css/sections/SchemePanel.module.css'

function SchemePanel({ title, schemes = [], tone = 'peach' }) {
  return (
    <div className={`${styles.panel} ${styles[tone]}`}>
      <h3 className={styles.title}>{title}</h3>
      <CardGrid minWidth={120}>
        {schemes.map((scheme, index) => (
          <InfoCard key={index} variant="tile" image={scheme.image} title={scheme.title} />
        ))}
      </CardGrid>
    </div>
  )
}

export default SchemePanel
