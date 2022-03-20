  // Docsify plugin functions
  function plugin(hook, vm) {
    hook.beforeEach(function (content) {
        var filename = vm.route.file
        var pos = filename.lastIndexOf('/');
        if (pos >= 0) {
            var baseName = filename.substring(pos + 1)
            var date = baseName.match(/\d{4}-\d{1,2}-\d{1,2}/g)
            if (date == null) {
              return content
            }
            return ">发布日期：" + date + '\n\n' + content
        }
        return content
    })
  }
  
  // Docsify plugin options
  window.$docsify = (window.$docsify || {})
  window.$docsify.plugins = (window.$docsify.plugins || []).concat(plugin)
  