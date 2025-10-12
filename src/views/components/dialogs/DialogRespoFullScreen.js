// ** React Imports
import { Fragment, useState } from 'react'

// ** MUI Imports
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import { useTheme } from '@mui/material/styles'
import DialogTitle from '@mui/material/DialogTitle'
import useMediaQuery from '@mui/material/useMediaQuery'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'

const DialogRespoFullScreen = (props) => {
  const {
    open,
    title,
    content,
    onAgree,
    onClose,
    agreeText,
    disagreeText
  } = props || {}
  // ** Hooks
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'))
  // Support uncontrolled mode when `open` is not provided
  const [openInternal, setOpenInternal] = useState(false)
  const isControlled = typeof open !== 'undefined'
  const dialogOpen = isControlled ? open : openInternal

  const defaultTitle = 'Use Google\'s location service?'
  const defaultContent = (
    <DialogContentText>
      Let Google help apps determine location. This means sending anonymous location data to Google, even when no apps are running.
    </DialogContentText>
  )
  const handleOpen = () => {
    if (!isControlled) setOpenInternal(true)
  }
  const handleClose = () => {
    if (onClose) onClose()
    if (!isControlled) setOpenInternal(false)
  }
  const handleAgree = () => {
    if (onAgree) onAgree()
    if (!isControlled) setOpenInternal(false)
  }

  return (
    <Fragment>
      {!isControlled && (
        <Button variant='outlined' onClick={handleOpen}>
          Open responsive dialog
        </Button>
      )}
      <Dialog fullScreen={fullScreen} open={dialogOpen} onClose={handleClose} aria-labelledby='responsive-dialog-title'>
        <DialogTitle id='responsive-dialog-title'>{title || defaultTitle}</DialogTitle>
        <DialogContent>
          {typeof content === 'undefined' ? (
            defaultContent
          ) : typeof content === 'string' ? (
            <DialogContentText>{content}</DialogContentText>
          ) : content}
        </DialogContent>
        <DialogActions className='dialog-actions-dense'>
          <Button onClick={handleClose}>{disagreeText || 'Disagree'}</Button>
          <Button onClick={handleAgree}>{agreeText || 'Agree'}</Button>
        </DialogActions>
      </Dialog>
    </Fragment>
  )
}

export default DialogRespoFullScreen
