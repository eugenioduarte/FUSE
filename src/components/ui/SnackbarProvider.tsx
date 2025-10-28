import React, { createContext, useCallback, useContext, useState } from 'react'
import { Snackbar, SnackbarType } from './Snackbar'

interface SnackbarContextProps {
  showSnackbar: (
    message: string,
    type?: SnackbarType,
    duration?: number,
  ) => void
}

const SnackbarContext = createContext<SnackbarContextProps | undefined>(
  undefined,
)

export const useSnackbar = () => {
  const ctx = useContext(SnackbarContext)
  if (!ctx)
    throw new Error('useSnackbar must be used within a SnackbarProvider')
  return ctx
}

export const SnackbarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')
  const [type, setType] = useState<SnackbarType>('info')
  const [duration, setDuration] = useState(3000)

  const showSnackbar = useCallback(
    (msg: string, t: SnackbarType = 'info', d = 3000) => {
      setMessage(msg)
      setType(t)
      setDuration(d)
      setVisible(true)
    },
    [],
  )

  const handleHide = useCallback(() => {
    setVisible(false)
  }, [])

  const value = React.useMemo(() => ({ showSnackbar }), [showSnackbar])
  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        visible={visible}
        message={message}
        type={type}
        duration={duration}
        onHide={handleHide}
      />
    </SnackbarContext.Provider>
  )
}
