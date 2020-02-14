/** @jsx jsx */
import { jsx, Box } from 'theme-ui'
import { toast, ToastContainer, Slide } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css';
import './style.css'

const ToastContent = ({ text, smallText }) => {
  return (
    <Box 
      sx={{
        backgroundColor: 'secondary',
        boxShadow: '0 8px 32px 0 rgba(76,102,255,0.48), 0 4px 16px 0 rgba(0,0,0,0.16)',
        padding: '15px'
      }}
    >
      <p sx={{ variant: "text.smaller", color: "rgba(255,255,255,0.64)" }}>{smallText}</p>
      <p sx={{ variant: "text.small", color: "white", fontWeight: 'heading' }}>{text}</p>
    </Box>
  )
}

export const callToast = ({ text, smallText }) => {
  toast(
    <ToastContent text={text} smallText={smallText} />,
  )
}

export const CustomToastContainer = () => {
  return (
    <ToastContainer
      sx={{
        marginRight: '10px'
      }}
      position={toast.POSITION.BOTTOM_RIGHT}
      hideProgressBar={true}
      closeButton={false}
      transition={Slide}
    />
  )
}