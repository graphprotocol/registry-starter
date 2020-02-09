/** @jsx jsx */
import { useState } from 'react'
import PropTypes from 'prop-types'
import { Styled, jsx } from 'theme-ui'
import { Grid } from '@theme-ui/components'

import ipfs from '../../services/ipfs'

const UploadImage = ({ setImage }) => {
  const [uploadingImage, setUploadingImage] = useState(false)
  const [imageUrl, setImageUrl] = useState('')
  const [imageName, setImageName] = useState('')

  const uploadImage = async (e, field) => {
    const image = e.target.files[0]
    if (image) {
      setUploadingImage(true)
      const reader = new window.FileReader()
      reader.readAsArrayBuffer(image)
      reader.onloadend = async () => {
        const buffer = await Buffer.from(reader.result)
        await ipfs.add(buffer, async (err, res) => {
          if (err) {
            console.error('Error saving doc to IPFS: ', err)
          }
          if (res) {
            const url = `${process.env.GATSBY_IPFS_HTTP_URI}/api/v0/cat?arg=${res[0].hash}`
            setUploadingImage(false)
            setImageUrl(url)
            setImageName(image.name)
            setImage({ url: url, name: image.name })
          }
        })
      }
    }
  }

  const removeImage = e => {
    e.preventDefault()
    e.stopPropagation()
    setImageUrl('')
    setImageName('')
  }

  return (
    <label
      sx={
        imageName && imageUrl
          ? {
              ...styles.label,
              border: 'none',
              backgroundColor: 'white',
              width: '100%',
              pr: 3,
            }
          : {
              ...styles.label,
              width: '100%',
              boxShadow: 'none',
              '&:hover': {
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'whiteFaded',
              },
            }
      }
    >
      <input
        sx={styles.input}
        name="upload-image"
        type="file"
        accept="image/*"
        onChange={uploadImage}
      />
      {imageUrl && imageName ? (
        <Grid sx={styles.grid} gap={0}>
          <img
            src={imageUrl}
            sx={{ height: '60px', width: '60px', position: 'relative' }}
            alt={imageName}
          />
          <Styled.p>{imageName}</Styled.p>
          <img
            src="/close.svg"
            alt="Close"
            sx={{
              transform: 'rotate(90deg)',
              fill: 'secondary',
              position: 'absolute',
              right: 4,
              top: 0,
              bottom: 0,
              margin: 'auto',
              width: '16px',
              height: '16px',
              padding: 1,
            }}
            onClick={removeImage}
          />
        </Grid>
      ) : (
        <Grid
          sx={{
            gridTemplateColumns: 'max-content max-content',
            justifyContent: 'center',
            alignItems: 'center',
            transition: 'all 1s ease',
          }}
          gap={2}
        >
          <p sx={{ variant: 'large' }}>Upload image</p>
          {uploadingImage && <div>loading..</div>}
        </Grid>
      )}
    </label>
  )
}

const styles = {
  grid: {
    gridTemplateColumns: '76px 1fr',
    textAlign: 'left',
    alignItems: 'center',
  },
  label: {
    color: 'blackFaded',
    bg: 'transparent',
    fontFamily: 'body',
    lineHeight: '4rem',
    height: '64px',
    cursor: 'pointer',
    display: 'block',
    textAlign: 'center',
    position: 'relative',
    border: '1px solid',
    borderColor: 'whiteFaded',
    width: '100%',
    boxShadow: '0 4px 24px 0 rgba(30,37,44,0.16)',
    transition: 'all 0.3s ease',
    '&:hover': {
      transition: 'all 0.3s ease',
      boxShadow:
        '0 4px 24px 0 rgba(149,152,171,0.16), 0 12px 48px 0 rgba(30,37,44,0.32)',
    },
  },
  input: {
    fontSize: 0,
    opacity: 0,
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    cursor: 'pointer',
  },
}

UploadImage.propTypes = {
  imageName: PropTypes.string,
  imageUrl: PropTypes.string,
  uploadImage: PropTypes.func,
}

export default UploadImage
