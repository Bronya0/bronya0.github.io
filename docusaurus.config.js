// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';


// https://docusaurus.io/zh-CN/docs/api/docusaurus-config
/** @type {import('@docusaurus/types').Config} */
const config = {
  title: '勾玉博客',
  tagline: '个人技术博客, python,go,开源,django',
  favicon: '/imgs/logo.jpg',
  url: 'https://blog.ysboke.cn',
  baseUrl: '/',
  staticDirectories: ['static'],
  // organizationName: 'github', // Usually your GitHub org/user name.
  // projectName: 'docusaurus', // Usually your repo name.

  // 添加插件配置
  plugins: [
    // 引入自定义插件
    require.resolve('./src/plugins/busuanzi-plugin'),
  ],

  //  自定义js
  scripts: [
    {
      src: '/js/custom.js',
      async: true,
    },
    {
      src: '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js',
      async: true,
    },
    // {
    //   src: '/live2d/live2d.js',
    //   // src: 'https://fastly.jsdelivr.net/gh/stevenjoezhang/live2d-widget@latest/autoload.js',
    //   async: true,
    // },
  ],


  // 自定义css
  stylesheets: [
    // 'https://docusaurus.io/style.css',
    // {
      // href: '/css/custom.css'
    // }
  ],


  onBrokenLinks: 'ignore',
  onBrokenMarkdownLinks: 'ignore',
  onBrokenMarkdownLinks: 'ignore',
  onDuplicateRoutes: 'ignore',

  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
// https://docusaurus.io/zh-CN/docs/api/plugins/@docusaurus/plugin-content-docs
  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */

      // https://docusaurus.io/docs/api/plugins/@docusaurus/plugin-content-blog
      ({
        docs: false,
        blog: {
          path: "blog",
          routeBasePath: 'posts',
          // 侧边栏显示几篇文章
          blogSidebarCount: 'ALL',
          // 列表页每页几篇博客
          postsPerPage: 10,
          tagsBasePath: 'tags',
          blogSidebarTitle: '近期文章',
          archiveBasePath: 'archive',
          // 禁用这两个选项，避免告警
          showLastUpdateAuthor: false,
          showLastUpdateTime: false,
          editLocalizedFiles: false,
          // feedOptions: { type: null },
          // 禁用 git 时间戳功能
          showReadingTime: false,
          editUrl: undefined,
          feedOptions: {
            type: 'all',
            copyright: `Copyright © ${new Date().getFullYear()}`,
          },
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: [
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
      ({
        // ... Your options.
        // `hashed` is recommended as long-term-cache of index file is possible.
        hashed: true,
        indexDocs: false,
        removeDefaultStopWordFilter: true,
        highlightSearchTermsOnTargetPage: true,
        blogRouteBasePath: "posts",
        blogDir: "blog",
        // searchBarPosition: "auto",
        // For Docs using Chinese, The `language` is recommended to set to:
        // ```
        language: ["en", "zh"],
        // ```
      }),
    ],
  ],

  // https://docusaurus.io/zh-CN/docs/api/themes/configuration
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: '/imgs/logo.png',
      blog: {
       sidebar: {
          groupByYear: true,
        },
      },
      navbar: {
        title: '勾玉博客',
        logo: {
          src: '/imgs/logo.png',
        },
        hideOnScroll: true,  // 向下滚动页面时，自动隐藏导航栏

        // 顶部导航，对应到siderbar.js配置的侧边栏
        items: [
          {to: '/posts/', label: '博客', position: 'left'},
          {to: '/posts/tags/', label: '分类', position: 'left'},
          { to: '/posts/archive/', label: '归档', position: 'left' },
          {
            type: 'dropdown',
            label: '我的开源',
            position: 'left',
            items: [
              {
                label: 'AgentGo',
                to: '/posts/golang/agent-go',
              },
              {
                label: 'Kafka-King',
                to: '/posts/tags/kafka-king/',
              },
              {
                label: 'ES-King',
                to: '/posts/tags/es-king/',
              },
              {
                label: 'epub-merge',
                to: '/posts/tools/epub-merge',
              },
              {
                label: 'django-onii',
                to: '/posts/python/django/django-onii',
              },
              {
                label: 'typora-theme-bronya',
                to: '/posts/tools/typora-theme-bronya',
              },
              {
                label: 'DreamTools',
                href: 'https://ysboke.cn/tool/json',
                target: '_blank',
              },
              {
                label: 'Jetbrains-Darcula-Zed-Theme',
                href: 'https://github.com/Bronya0/Jetbrains-Darcula-Zed-Theme',
                target: '_blank',
              },
              {
                label: 'OnlyWallpaper',
                href: 'https://github.com/Bronya0/OnlyWallpaper',
                target: '_blank',
              },
              {
                label: 'OnlyWallpaper-Win',
                href: 'https://github.com/Bronya0/OnlyWallpaper-Win',
                target: '_blank',
              },
             ]
          },
          {
            type: 'search',
            position: 'left',
          },
          { to: '/friend-links', label: '友情链接', position: 'right' },
          // { to: '/about-me', label: '关于我', position: 'right'},

          // { href: 'https://github.com/Bronya0', label: 'GitHub', position: 'right'},

          // {
          //   // type: 'blogSidebar',
          //   sidebarId: 'root',
          //   position: 'right',
          //   label: '工具',
          // },

        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'site',
            items: [
              {
                label: 'sitemap',
                href: 'https://blog.ysboke.cn/sitemap.xml',
              },
            ],
          },
          // {
          //   title: 'Community',
          //   items: [
          //     {
          //       label: 'Stack Overflow',
          //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
          //     },
          //     {
          //       label: 'Discord',
          //       href: 'https://discordapp.com/invite/docusaurus',
          //     },
          //     {
          //       label: 'Twitter',
          //       href: 'https://twitter.com/docusaurus',
          //     },
          //   ],
          // },
          // {
          //   title: '友链',
          //   items: [
          //     // {
          //     //   label: 'GitHub',
          //     //   href: 'https://github.com/Bronya0',
          //     // },
          //   ],
          // },
          {
            title: '链接',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/Bronya0',
              },
              {
                label: '关于我',
                to: '/about-me',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} 勾玉博客 | <span id="busuanzi_container_site_pv">本站总访问量 <span id="busuanzi_value_site_pv"></span> 次</span><br>
        <a target="_blank" rel="nofollow" href="https://beian.miit.gov.cn">皖ICP备19012919号-2</a><br>
        `,
      },

      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.vsDark,
        defaultLanguage: 'bash',
        additionalLanguages: ['bash'],
      },

      
    }),

  future: {
  },

  markdown: {
    mermaid: true,
  },
  themes: ['@docusaurus/theme-mermaid'],
  
};

export default config;
