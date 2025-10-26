module.exports = {
  siteUrl: 'https://frontend.buildcha.workers.dev/',
  generateRobotsTxt: true,
  sourceDir: '.next', // 必要なら追加
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
    ],
  },
}