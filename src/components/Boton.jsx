import { Link } from 'react-router-dom'

function Boton({ children, variante, chico, to, href, type = 'button', onClick, disabled }) {
  const clases = `boton boton--${variante} ${chico ? 'boton--chico' : ''}`

  if (to) {
    return (
      <Link className={clases} to={to}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a className={clases} href={href}>
        {children}
      </a>
    )
  }

  return (
    <button className={clases} type={type} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  )
}

export default Boton
