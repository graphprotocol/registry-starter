let env = process.env.CI ? 'development' : process.env.NODE_ENV
require("dotenv").config({
  path: `.env.${env}`,
})

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  // set up client-side routes
  if (page.path.match(/^\/tokens\/edit\//)) {
    page.matchPath = '/edit/*'
    createPage(page)
  }

  if (page.path.match(/^\/token\//)) {
    page.matchPath = '/token/*'
    createPage(page)
  }

  if (page.path.match(/^\/profile\//)) {
    page.matchPath = '/profile/*'
    createPage(page)
  }
}

exports.onCreateWebpackConfig = ({
  stage,
  rules,
  loaders,
  plugins,
  actions,
}) => {
  actions.setWebpackConfig({
    node: { fs: 'empty', net: 'empty', child_process: 'empty' },
  })
}
