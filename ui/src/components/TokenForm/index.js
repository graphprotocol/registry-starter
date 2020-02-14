/** @jsx jsx */
import PropTypes from 'prop-types'
import { jsx, Box } from 'theme-ui'
import Field from '../Field'
import Button from '../Button'
import UploadImage from '../UploadImage'

const TokenForm = ({
  token,
  setValue,
  isDisabled,
  isNew,
  isLoading,
  handleSubmit,
}) => (
  <form onSubmit={handleSubmit}>
    <Field
      type="input"
      title="Token Symbol"
      placeholder="Example: ETH"
      charsCount={10}
      value={token.symbol}
      setValue={value => setValue('symbol', value)}
    />
    <Field
      type="textarea"
      title="Description"
      placeholder="Describe the token"
      charsCount={300}
      value={token.description}
      setValue={value => setValue('description', value)}
    />
    <Field
      type="input"
      title="Contract Address (optional)"
      placeholder="Enter address"
      charsCount={42}
      value={token.address}
      setValue={value => setValue('address', value)}
    />
    <Box sx={{ my: 6 }}>
      <p sx={{ variant: 'text.small', color: 'secondary', mb: 2 }}>
        Token Logo (optional)
      </p>
      <UploadImage setValue={setValue} />
    </Box>
    <Field
      type="input"
      title="Number of Decimals"
      placeholder="Enter amount"
      charsCount={10}
      value={token.decimals}
      setValue={value => setValue('decimals', value)}
    />
    <Button
      text={isNew ? 'Add Token' : 'Update Token'}
      variant="primary"
      isDisabled={isDisabled}
      isLoading={isLoading}
      onClick={handleSubmit}
    />
  </form>
)

TokenForm.propTypes = {
  token: PropTypes.any,
  setValue: PropTypes.func,
  handleSubmit: PropTypes.func,
  isDisabled: PropTypes.bool,
  isNew: PropTypes.bool,
  isLoading: PropTypes.bool,
}

export default TokenForm
