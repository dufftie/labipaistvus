import type { MDXComponents } from 'mdx/types'
import styles from './mdx-components.module.scss'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    wrapper: ({ children }) => <div className={styles.wrapper}>{children}</div>,
    h1: ({ children }) => <h1 className={styles.h1}>{children}</h1>,
    h2: ({ children }) => <h2 className={styles.h2}>{children}</h2>,
    p: ({ children }) => <p className={styles.p}>{children}</p>,
    ol: ({ children }) => <ol className={styles.ol}>{children}</ol>,
    ul: ({ children }) => <ul className={styles.ul}>{children}</ul>,
    li: ({ children }) => <li className={styles.li}>{children}</li>,
    code: ({ children }) => <code className={styles.code}>{children}</code>,
    pre: ({ children }) => <pre className={styles.pre}>{children}</pre>,
    blockquote: ({ children }) => <blockquote className={styles.blockquote}>{children}</blockquote>,
    a: ({ children, ...props }) => <a className={styles.a} {...props}>{children}</a>,
    ...components,
  }
}