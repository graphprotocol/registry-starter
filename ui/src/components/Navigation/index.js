/** @jsx jsx */
import { jsx, Styled } from "theme-ui"
import { Grid } from "@theme-ui/components"
import { Link } from "gatsby"
import Logo from "../../images/logo.svg"

export default ({ children, mainStyles, ...props }) => {
  return (
    <Grid
      sx={{
        gridTemplateColumns: "1fr max-content",
        justifyContent: "space-between",
        height: "128px",
        alignItems: "center",
      }}
      {...props}
    >
      <Grid
        sx={{
          gridTemplateColumns: "max-content max-content",
          alignItems: "center",
        }}
        gap={2}
      >
        <Logo sx={{ width: "24px", height: "24px" }} />
        <Styled.h4>Tokens</Styled.h4>
      </Grid>
      <Grid>Sign In</Grid>
    </Grid>
  )
}
