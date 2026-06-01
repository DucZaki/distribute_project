import { useState, type InputHTMLAttributes } from 'react'

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  id: string
}

export function PasswordInput({ id, className = '', ...rest }: PasswordInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="auth-input-wrap">
      <input
        id={id}
        type={visible ? 'text' : 'password'}
        className={`auth-input ${className}`.trim()}
        {...rest}
      />
      <button
        type="button"
        className="auth-toggle-pw"
        aria-label={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
        onClick={() => setVisible((v) => !v)}
      >
        <i className={`bi ${visible ? 'bi-eye-slash' : 'bi-eye'}`} />
      </button>
    </div>
  )
}
