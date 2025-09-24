module.exports = function(context, options) {
  return {
    name: 'busuanzi-plugin',
    injectHtmlTags() {
      return {
        postBodyTags: [
          {
            tagName: 'script',
            innerHTML: `
              (function() {
                var pushState = history.pushState;
                history.pushState = function() {
                  pushState.apply(history, arguments);
                  // 清除旧的计数器数据
                  window.busuanzi_value_site_pv = undefined;
                  window.busuanzi_value_site_uv = undefined;
                  // 重新加载统计脚本
                  var script = document.createElement('script');
                  script.src = '//busuanzi.ibruce.info/busuanzi/2.3/busuanzi.pure.mini.js';
                  script.async = true;
                  document.body.appendChild(script);
                };
              })();
            `,
          },
        ],
      };
    },
  };
};