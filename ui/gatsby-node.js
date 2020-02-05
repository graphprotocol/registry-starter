exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  // set up client-side routes
  // if (page.path.match(/^\/tokens\/edit\//)) {
  //   page.matchPath = '/edit/*'
  //   createPage(page)
  // }

  if (page.path.match(/^\/token\//)) {
    page.matchPath = '/token/*'
    createPage(page)
  }

  if (page.path.match(/^\/profile\//)) {
    page.matchPath = '/profile/*'
    createPage(page)
  }
}
