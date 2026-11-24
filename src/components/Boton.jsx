import { Link } from 'react-router-dom'

export default function Boton({
  children,
  variante = 'primario',
  chico = false,
  to,
  href,
  className = '',
  type = 'button',
  ...resto
}) {
  const clases = [
    'boton',
    `boton--${variante}`,
    chico ? 'boton--chico' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (to) {
    return (
      <Link className={clases} to={to} {...resto}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={clases} href={href} {...resto}>
        {children}
      </a>
    )
  }

  return (
    <button className={clases} type={type} {...resto}>
      {children}
    </button>
  )
}
