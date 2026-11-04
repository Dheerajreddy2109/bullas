import ScopeLink from './ScopeLink.jsx'
import styles from '../css/TemplateCard.module.css'

function TemplateCard({ template }) {
  const previewPath = `/templates/${template.slug}/preview`

  return (
    <article className={styles.card}>
      {/* A live miniature of the real layout, so it can never go out of date like a screenshot. */}
      <div className={styles.thumbnail}>
        <iframe
          className={styles.frame}
          src={`${previewPath}?thumbnail=1`}
          title={`${template.name} thumbnail`}
          loading="lazy"
          tabIndex={-1}
        />
      </div>
      <div className={styles.body}>
        <h2 className={styles.name}>{template.name}</h2>
        <p className={styles.description}>{template.description}</p>
        <ScopeLink className={styles.button} to={previewPath}>
          Preview
        </ScopeLink>
      </div>
    </article>
  )
}

export default TemplateCard
