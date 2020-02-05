module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-react-svg',
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Curation dApp Starter`,
        short_name: `dApp Starter`,
        start_url: `/`,
        background_color: `white`,
        theme_color: `white`,
        display: `minimal-ui`,
        icon: `static/logo.png`, // This path is relative to the root of the site.
      },
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // This type will contain remote schema Query type
        typeName: 'curationStarter',
        // This is the field under which it's accessible
        fieldName: 'curationStarter',
        // URL to query from
        url: 'https://eu1.prisma.sh/nevena-djaja/curation-starter/dev',
      },
    },
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: `Lato`,
            variants: [`300`, `400`, `900`],
          },
        ],
      },
    },
    // {
    //   resolve: `gatsby-source-filesystem`,
    //   options: {
    //     name: `images`,
    //     path: `${__dirname}/src/images`,
    //   },
    // },
  ],
}
