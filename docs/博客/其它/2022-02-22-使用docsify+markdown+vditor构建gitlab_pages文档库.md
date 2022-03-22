前几天策划写了一个word文档来整理补充一些内容，当时就比较感慨，如果是Web文档就好了，可以超链接过去，也不必东一个文档，西一个文档的查找。

确实如此，工作这么久，各个公司的策划案都是使用的Word文档的形式给别的部门，策划写起来是方便了，但是其他岗位的人要看文档来制作就比较麻烦了，比如程序，一个项目中可能会有几十甚至几百个文档，这些文档之间的内容可能会有相互关联，使用WORD文档，可能过段时间，策划自己都不知道放哪个文档了，于是就出了各种整理文档，补充文档。

使用Web来管理文档是好，但要让策划直接编写网页制作策划案，我想应该基本上没人响应。那就只能迂回一点，平常写博客这类的文档，使用最多的就是Markdown了，而且目前使用Markdown格式作为各种网络文档也是非常常见的，比如github、gitlab、CSDN、各种笔记类APP等等。

有了使用Web来管理策划案的想法后，就着手查资料开干。
查下来目前比较常见的工具有：

1. [jekyll](http://jekyllcn.com/)
2. [gitbook](https://github.com/GitbookIO/gitbook)
3. [Hexo](https://hexo.io/zh-cn/index.html)
4. [Gatsby](https://www.gatsbyjs.cn/)
5. [Hugo](https://www.gohugo.org/)
6. [vuepress](https://vuepress.vuejs.org/zh/)
7. [Docsify](https://docsify.js.org/#/zh-cn/)
8. [Docute](https://docute.org/zh/)
9. [Nuxt](https://nuxtjs.org/)

笔者之前写过一篇[《使用jekyll写博客》](https://blog.csdn.net/witton/article/details/119668286?spm=1001.2014.3001.5501)，就是介绍的使用jekyll来编写[github的博客](https://wittonbell.github.io/)。
jekyll使用的ruby语言来构建静态网页，要使用这个工具，搭建语言环境比较麻烦，笔者在MacOS上为了使用jekyll，记得卡在了ruby的版本上，要求高版本，但OS又支持不了高版本，就此作罢，只能Windows上用用。

其它工具就不一一介绍了，都做了超链接，感兴趣的读者可以自行点开了解。今天要介绍是主角是Docsify，它与Docute一起成为与其它工具不一样的选择。

Docsify与Docute都是基于 Vue，且它们都是完全的运行时驱动，不会生成静态html，因此对 SEO 不够友好。如果你并不关注 SEO，同时也不想安装大量依赖，它们将是非常好的选择！在公司内部做策划文档的管理，不需要SEO，所以使用运行时驱动的Docsify或者Docute是完全可以的。之所以选择Docsify，一是因为最先发现它，二是它比Docute小，插件这些也比较丰富。

下面就介绍一下如何使用docsify构建gitlab Pages上的文档库。

# 一、开启gitlab pages

编辑/etc/gitlab/gitlab.rb，设置pages_external_url为自定义的域名，并且设置gitlab_pages['enable']为true，如果要打开访问控制，则需要设置gitlab_pages['access_control']为true，如下所示：

```
################################################################################
## GitLab Pages
##! Docs: https://docs.gitlab.com/ee/pages/administration.html
################################################################################

##! Define to enable GitLab Pages
pages_external_url "http://pages.io/"
gitlab_pages['enable'] = true

##! Pages access control
gitlab_pages['access_control'] = true
```

设置好后运行下面的命令生效：

```bash
gitlab-ctl reconfigure
```

# 二、gitlab网站设置

## 1. 访问控制

如果需要访问控制，则需要：
在“菜单”=>“管理员”=>“设置”=>“偏好设置”中展开Pages选项，勾选

- 要求用户证明自定义域名的所有权
- 禁止公开访问 Pages 站点

如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/91121e0a2a1b4b99adb84d24a1819315.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

最大页面大小默认为100M，可以根据实际情况调整。设置完成后记得执行“保存修改”。

## 2. 项目设置

在开启Pages后，项目设置，通用里会根据项目可见性自动设置Pages的可见性，并且项目设置里会看到Pages栏，如下图所示：

![在这里插入图片描述](https://img-blog.csdnimg.cn/d826b780bad7481ab463fa9b179376f7.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

此时还没有任何可用页面。

# 三、编写网页

使用docsify+markdown文件来构建网页，只需要编写一个index.html即可。其它的就是根据docsify规则 编写markdown文件。

本地编写markdown文件建议使用VSCode+Office Viewer(Markdown Editor)插件，Office Viewer(Markdown Editor)插件使用了[vditor](https://b3log.org/vditor/) markdown编辑器，不得不说该编辑器非常强大。

如果想在本地编写好后，预览网页，满意后，再发布到gitlab pages。则需要在本地安装相应的环境。先安装[node.js](https://nodejs.org/zh-cn/)，再根据[官方文档](https://docsify.js.org/#/zh-cn/quickstart)创建相应的项目。

具体如何编写这里就不再赘述了，可以看[官方文档](https://docsify.js.org/#/zh-cn/)。官方文档给出了一个插件列表[awesome-docsify](https://github.com/docsifyjs/awesome-docsify)，里面有很多插件，可以丰富docsify。

这里主要介绍一下官网上没有的或者需要注意的东西。

docsify内置的 Markdown 解析器是 [marked](https://github.com/markedjs/marked)，对markdown的支持有限，像数学公式，mermaid图这些都不支持，官网上对[markdown的配置](https://docsify.js.org/#/zh-cn/markdown)所提甚少，只提供了mermaid图的配置，数学公式没有提及。

下面结合[awesome-docsify](https://github.com/docsifyjs/awesome-docsify)中提供的插件，介绍一下几种常用的额外功能配置：

## 1. mermaid图

直接使用插件[docsify-mermaid](https://github.com/Leward/mermaid-docsify)；

```html
	<!--mermaid图支持-->
    <script src="//unpkg.com/mermaid/dist/mermaid.js"></script>
    <script src="//unpkg.com/docsify-mermaid@latest/dist/docsify-mermaid.js"></script>
    <script>
      mermaid.initialize({ startOnLoad: true });
    </script>
```

## 2. plantuml图

直接使用插件[docsify-plantuml](https://github.com/imyelo/docsify-plantuml) 或者插件[docsify-puml](https://github.com/indieatom/docsify-puml)

```html
<script>
      window.$docsify = {
		plantuml: {
          skin: "classic",
        },
     }
</script>
<!--plantuml图支持-->
<script src="//unpkg.com/docsify-plantuml/dist/docsify-plantuml.min.js"></script>
```

## 3.数学公式

数学公式，这里需要提一下，markdown中的数学公式有几种格式，不同的平台支持的写法也不一致。
常见的markdown数学公式有以下几种写法：

- 以 `` $` ``开头，并以`` `$ ``结尾的行内公式（gitlab支持，vditor会多显示一对单引号）
- 以 `$`开头和结尾的行内公式（gitlab不支持，vditor支持）
- 以 `$$`开头和结尾的块公式（gitlab不支持，vditor支持）
- 以math块标识的块公式（gitlab支持，vditor支持）

有一个插件[docsify-katex](https://github.com/upupming/docsify-katex) 支持使用katex输出数学公式，但是试用了一下，没达到预期。docsify有一个[issues](https://github.com/docsifyjs/docsify/issues/96)提到怎样支持数学公式，但不尽如意。

笔者通过查资料和自己的修改得出如下配置：

```html
<script>
      window.$docsify = {
      plugins: [
          function (hook) {
            hook.doneEach(function () {
              if (typeof MathJax !== "undefined") {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
              }
            });
            // 支持$`...`$块
            hook.beforeEach(function (content) {
              return content.replace(/\$`.*`\$/g, function (a) {
                return a.replace("`", "").replace("`", "");
              });
            });
            // 支持```math```块
            hook.beforeEach(function (content) {
              return content.replace("\r\n","\n");
            });
            hook.beforeEach(function (content) {
              return content.replace("\r","\n");
            });
            hook.beforeEach(function (content) {
              c = content.replace(
                /```math\n[^`]*\n```/g,
                function (a) {
                  return a
                    .replace("```math", "\$\$\$\$")
                    .replace("```", "\$\$\$\$");
                }
              );
              return c
            });
          },
        ],
      }
</script>

<script type="text/x-mathjax-config">
      MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [['$','$'], ['\\(','\\)']],
        displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        processClass: 'math',
        processEscapes: true
      },
      TeX: {
      equationNumbers: { autoNumber: ['AMS'], useLabelIds: true },
      extensions: ['extpfeil.js', 'mediawiki-texvc.js'],
      Macros: {bm: "\\boldsymbol"}
      },
      'HTML-CSS': { linebreaks: { automatic: true } },
      'preview-HTML': { linebreaks: { automatic: true } },
      SVG: { linebreaks: { automatic: true } }
      });
</script>

<!--MathJax数学公式支持-->
<script src="//cdn.bootcss.com/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>
```

下图为数学公式示例输出：

![在这里插入图片描述](https://img-blog.csdnimg.cn/2a48a098782e48d290e888133b919526.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

# 四、预览网页

预览网页只需要在项目所在目录的命令行运行：

```bash
docsify serve
```

# 五、发布到gitlab pages

## 1. 编写.gitlab-ci.yml

为了让gitlab pages能正常显示网页，需要使用到gitlab的CI/CD功能，在项目根目录创建一个.gitlab-ci.yml文件，也可以在gitlab网站上新建，选择.gitlab-ci.yml模板，应用html模板。

![在这里插入图片描述](https://img-blog.csdnimg.cn/9a171c1efc5f4032b34ab366515ba826.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/94fb2b99d4844d9f8b96baa40668ae04.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

![在这里插入图片描述](https://img-blog.csdnimg.cn/a2779b3c8c2e48bf9db4812a1ec333d8.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

或者把生成的内容复制到本地建。

```yaml
pages:
  stage: deploy
  script:
    - mkdir .public
    - cp -r * .public
    - mv .public public
  artifacts:
    paths:
      - public
  rules:
    - if: $CI_COMMIT_BRANCH == $CI_DEFAULT_BRANCH
```

这样每次提交更改后，gitlab都会自动更新页面。
成功后就可以在项目设置的Pages下看到网页的访问地址了：

![在这里插入图片描述](https://img-blog.csdnimg.cn/6dfa0d8f957a496ea7f8afb0427a1642.png?x-oss-process=image/watermark,type_d3F5LXplbmhlaQ,shadow_50,text_Q1NETiBAd2l0dG9u,size_20,color_FFFFFF,t_70,g_se,x_16)

## 2. 修改hosts

由于前面在配置gitlab.rb时pages_external_url是随便配置的，为了能正常访问，需要将之映射到gitlab所在的ip，修改C:\Windows\System32\drivers\etc\hosts，添加映射：

```bash
192.168.1.6 docs.pages.io
192.168.1.6 projects.pages.io
```

docs.pages.io是平常访问用到的域名，其中的docs是gitlab中项目所在的组或者用户
projects.pages.io是访问控制授权时需要用到的域名。

# 六、附index.html源码

````html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Document</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="Description" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"
    />
  </head>

  <body>
    <div id="app"></div>
    <script>
      window.$docsify = {
        loadNavbar: true,
        loadSidebar: true,
        loadSidebar: "summary.md",
        autoHeader: true,
        subMaxLevel: 3,
        auto2top: true,
        name: "主页",
        homepage: 'index.md',
        basePath: 'docs',
        repo: "http://192.168.1.6/",

        pagination: {
          previousText: "上一篇",
          nextText: "下一篇",
          crossChapter: true,
          crossChapterText: false,
        },

        count: {
          countable: true,
          fontsize: "0.9em",
          color: "rgb(90,90,90)",
          language: "chinese",
        },

        search: {
          maxAge: 864, // 过期时间，单位毫秒，默认一天
          placeholder: "搜索",
          noData: "找不到结果",
          namespace: "文档",
        },

        plantuml: {
          skin: "classic",
        },

        timeUpdater: {
          text: ">最后更新时间: {docsify-updated}",
          formatUpdated: "{YYYY}/{MM}/{DD} {HH}:{mm}",
        },

        plugins: [
          function (hook) {
            // 支持$$
            hook.doneEach(function () {
              if (typeof MathJax !== "undefined") {
                MathJax.Hub.Queue(["Typeset", MathJax.Hub]);
              }
            });
            // 支持$``$
            hook.beforeEach(function (content) {
              return content.replace(/\$`.*`\$/g, function (a) {
                return a.replace("`", "").replace("`", "");
              });
            });
            // 支持```math```块
            hook.beforeEach(function (content) {
              return content.replace("\r\n","\n");
            });
            hook.beforeEach(function (content) {
              return content.replace("\r","\n");
            });
            hook.beforeEach(function (content) {
              c = content.replace(
                /```math\n[^`]*\n```/g,
                function (a) {
                  return a
                    .replace("```math", "\$\$\$\$")
                    .replace("```", "\$\$\$\$");
                }
              );
              return c
            });
          },
        ],
      };
    </script>
    <script type="text/x-mathjax-config">
      MathJax.Hub.Config({
      tex2jax: {
        inlineMath: [['$','$'], ['\\(','\\)']],
        displayMath: [ ['$$','$$'], ["\\[","\\]"] ],
        processClass: 'math',
        processEscapes: true
      },
      TeX: {
      equationNumbers: { autoNumber: ['AMS'], useLabelIds: true },
      extensions: ['extpfeil.js', 'mediawiki-texvc.js'],
      Macros: {bm: "\\boldsymbol"}
      },
      'preview-HTML': { linebreaks: { automatic: true } },
      SVG: { linebreaks: { automatic: true } }
      });
    </script>
    <!-- Docsify v4 -->
    <script src="//cdn.jsdelivr.net/npm/docsify"></script>

    <!--MathJax数学公式支持-->
    <script src="//cdn.bootcss.com/mathjax/2.7.5/MathJax.js?config=TeX-AMS-MML_HTMLorMML"></script>

    <!--plantuml图支持-->
    <script src="//unpkg.com/docsify-plantuml/dist/docsify-plantuml.min.js"></script>

    <!--mermaid图支持-->
    <script src="//unpkg.com/mermaid/dist/mermaid.js"></script>
    <script src="//unpkg.com/docsify-mermaid@latest/dist/docsify-mermaid.js"></script>

    <!--字数统计-->
    <script src="//unpkg.com/docsify-count/dist/countable.js"></script>

    <!-- emoji表情支持 -->
    <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/emoji.min.js"></script>
    <!-- 搜索功能支持 -->
    <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
    <!--在所有的代码块上添加一个简单的Click to copy按钮来允许用户从你的文档中轻易地复制代码-->
    <script src="//cdn.jsdelivr.net/npm/docsify-copy-code/dist/docsify-copy-code.min.js"></script>
    <!-- 图片放大缩小支持 -->
    <script src="//unpkg.com/docsify/lib/plugins/zoom-image.min.js"></script>
    <!--分页支持-->
    <script src="//unpkg.com/docsify-pagination/dist/docsify-pagination.min.js"></script>
    <!-- 更新时间支持 -->
    <script src="https://cdn.jsdelivr.net/npm/docsify-updated@1/src/time-updater.min.js"></script>

    <!--语法高亮-->
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-c.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-cpp.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-csharp.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-go.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-go-module.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-cmake.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-lua.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-mermaid.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-protobuf.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-docker.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-java.min.js"></script>
  </body>
</html>
````

其实我们可以直接使用vditor来渲染，这样就能与VSCode中的表现完全一致（都是使用的vditor），但是docsify的其它插件就用不了了，同时图片的URL生成也有问题，显示不了本地图片。记录一下配置：

````html
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/vditor/dist/index.css" />
  <script src="https://cdn.jsdelivr.net/npm/vditor/dist/index.min.js"></script>
  <script>
    window.$docsify = {
      plugins: [
        function (hook) {
          hook.beforeEach(function (content) {
            // 获取内容输出的节点
            const previewElement = document.getElementById('main')
            Vditor.preview(previewElement, content, {
              markdown: {
                toc: true,
                // 使用vditor来渲染Markdown最好不使用history模式，否则可能引起路由错误
                // linkBase这个设置对Hash路由方式非常重要
                linkBase: '#',
              },
              speech: {
                enable: true,
              },
              math: {
                // VSCode的Office Viewer(Markdown Editor)插件使用的是'KaTeX'引擎，
                // 这里与之保持一致，当然也可以使用'MathJax'引擎
                engine: 'KaTeX',
                //engine: 'MathJax',
              },
            })
          })
        }
      ]
    }
  </script>
````

经过多番研究，使用docsify插件，配置出了比Vditor更强大的配置，支持

- LaTex数学公式
- mermaid图
- dot图
- plantuml图
- graphviz图
- mindmap图
- echarts图表
- charty图表

记录一下：
index.html：

````html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>文档库</title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="description" content="Description" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, minimum-scale=1.0"
    />
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify@4/lib/themes/vue.css"
    />
    <!-- 支持 LaTex 语言 -->
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/katex@latest/dist/katex.min.css"
    />

    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/docsify-dark-mode@latest/dist/style.min.css"
    />

    <link
      rel="stylesheet"
      href="https://unpkg.com/docsify-toc@1.0.0/dist/toc.css"
    />
  </head>

  <body>
    <!-- markmap is based on d3, so must load those files first. -->
    <script src="//unpkg.com/d3@3/d3.min.js"></script>
    <script src="//unpkg.com/markmap@0.6.1/lib/d3-flextree.js"></script>
    <script src="//unpkg.com/markmap@0.6.1/lib/view.mindmap.js"></script>
    <link
      rel="stylesheet"
      href="//unpkg.com/markmap@0.6.1/style/view.mindmap.css"
    />

    <div id="app">拼命加载中……</div>

    <script>
      window.$docsify = {
        loadNavbar: true,
        loadNavbar: "navbar.md",
        loadSidebar: true,
        loadSidebar: "sidebar.md",
        loadFooter: true,
        loadFooter: "footer.md",
        autoHeader: true,
        subMaxLevel: 3,
        auto2top: true,
        mergeNavbar: true,
        topMargin: 0,
        name: "文档库",
        //repo: "http://127.0.0.1/",

        //themeColor: "#42b983",
        tabs: { persist: true, theme: "material" },

        // 图表
        charty: {
          theme: "#EE5599",
          mode: "light",
        },

        toc: {
          scope: ".markdown-section",
          headings: "h1, h2, h3",
          title: "大纲",
        },

        copyCode: {
          buttonText: "复制到剪贴板",
          errorText: "错误",
          successText: "已复制",
        },

        // 文本高亮
        "flexible-alerts": {
          style: "flat",
          note: {
            label: "信息",
          },
          tip: {
            label: "提示",
          },
          warning: {
            label: "警告",
          },
          attention: {
            label: "注意",
          },
        },

        pagination: {
          previousText: "上一篇",
          nextText: "下一篇",
          crossChapter: true,
          crossChapterText: false,
        },

        count: {
          countable: true,
          fontsize: "0.9em",
          color: "rgb(90,90,90)",
          language: "chinese",
        },

        search: {
          maxAge: 180000, // 过期时间，单位毫秒，默认3分钟
          placeholder: "搜索",
          noData: "找不到结果",
          namespace: "文档",
        },

        plantuml: {
          skin: "classic",
          renderSvgAsObject: true,
        },

        mindmap: {
          markmap: {
            preset: "colorful", // or default
            linkShape: "diagonal", // or bracket
          },
        },

        timeUpdater: {
          text: ">最后更新时间: {docsify-updated}",
          formatUpdated: "{YYYY}/{MM}/{DD} {HH}:{mm}",
        },

        markdown: {
          renderer: {
            code: function (code, lang, base = null) {
              if (lang === "dot") {
                return '<div class="viz">' + Viz(code, "SVG") + "</div>";
              }

              var pdf_renderer = function (code, lang, verify) {
                function unique_id_generator() {
                  function rand_gen() {
                    return Math.floor((Math.random() + 1) * 65536)
                      .toString(16)
                      .substring(1);
                  }
                  return (
                    rand_gen() +
                    rand_gen() +
                    "-" +
                    rand_gen() +
                    "-" +
                    rand_gen() +
                    "-" +
                    rand_gen() +
                    "-" +
                    rand_gen() +
                    rand_gen() +
                    rand_gen()
                  );
                }
                if (
                  lang &&
                  !lang.localeCompare("pdf", "en", { sensitivity: "base" })
                ) {
                  if (verify) {
                    return true;
                  } else {
                    var divId =
                      "markdown_code_pdf_container_" +
                      unique_id_generator().toString();
                    var container_list = new Array();
                    if (localStorage.getItem("pdf_container_list")) {
                      container_list = JSON.parse(
                        localStorage.getItem("pdf_container_list")
                      );
                    }
                    container_list.push({ pdf_location: code, div_id: divId });
                    localStorage.setItem(
                      "pdf_container_list",
                      JSON.stringify(container_list)
                    );
                    return (
                      '<div style="margin-top:' +
                      PDF_MARGIN_TOP +
                      "; margin-bottom:" +
                      PDF_MARGIN_BOTTOM +
                      ';" id="' +
                      divId +
                      '">' +
                      '<a href="' +
                      code +
                      '"> Link </a> to ' +
                      code +
                      "</div>"
                    );
                  }
                }
                return false;
              };

              if (pdf_renderer(code, lang, true)) {
                return pdf_renderer(code, lang, false);
              }

              return base ? base : this.origin.code.apply(this, arguments);
            },
          },
        },
      };
    </script>

    <!-- Docsify -->
    <script src="https://cdn.jsdelivr.net/npm/docsify/lib/docsify.min.js"></script>

    <script src="//cdn.jsdelivr.net/npm/docsify-dark-mode@latest/dist/index.min.js"></script>
    <script src="//unpkg.com/docsify-toc@1.0.0/dist/toc.js"></script>

    <!-- charty -->
    <script src="//cdn.jsdelivr.net/npm/@markbattistella/docsify-charty@latest"></script>
    <link
      rel="stylesheet"
      href="//cdn.jsdelivr.net/npm/@markbattistella/docsify-charty@latest/dist/docsify-charty.min.css"
    />

    <!-- docsify: tabs -->
    <script src="//cdn.jsdelivr.net/npm/docsify-tabs@1"></script>

    <!-- 脑图 -->
    <script src="//unpkg.com/docsify-mindmap/dist/docsify-mindmap.min.js"></script>

    <!--plantuml图支持-->
    <script src="//unpkg.com/docsify-plantuml/dist/docsify-plantuml.min.js"></script>

    <!-- 支持 DOT 语言 -->
    <script src="https://cdn.jsdelivr.net/gh/wugenqiang/NoteBook@master/plugin/viz.js"></script>
    <!-- 支持 LaTex 语言 -->
    <script src="//cdn.jsdelivr.net/npm/docsify-katex@latest/dist/docsify-katex.js"></script>

    <!--mermaid支持-->
    <script src="//unpkg.com/mermaid/dist/mermaid.js"></script>
    <script src="//unpkg.com/docsify-mermaid@latest/dist/docsify-mermaid.js"></script>

    <!--graphviz支持-->
    <script src="//unpkg.com/@hpcc-js/wasm/dist/index.min.js"></script>
    <script src="//unpkg.com/docsify-graphviz@latest/dist/docsify-graphviz.js"></script>

    <!-- alerts -->
    <script src="https://unpkg.com/docsify-plugin-flexible-alerts"></script>

    <!-- echarts -->
    <script src="//cdn.jsdelivr.net/npm/echarts@latest/dist/echarts.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/docsify-echarts-plugin/lib/index.min.js"></script>

    <!-- 添加 PDF 页面展示功能 -->
    <script src="//cdnjs.cloudflare.com/ajax/libs/pdfobject/2.1.1/pdfobject.min.js"></script>
    <script src="//unpkg.com/docsify-pdf-embed-plugin/src/docsify-pdf-embed.js"></script>

    <!-- emoji表情支持 -->
    <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/emoji.min.js"></script>
    <!-- 搜索功能支持 -->
    <script src="//cdn.jsdelivr.net/npm/docsify/lib/plugins/search.min.js"></script>
    <!--在所有的代码块上添加一个简单的Click to copy按钮来允许用户从你的文档中轻易地复制代码-->
    <script src="//cdn.jsdelivr.net/npm/docsify-copy-code/dist/docsify-copy-code.min.js"></script>
    <!-- 图片放大缩小支持 -->
    <script src="//unpkg.com/docsify/lib/plugins/zoom-image.min.js"></script>
    <!--分页支持-->
    <script src="//unpkg.com/docsify-pagination/dist/docsify-pagination.min.js"></script>
    <!-- 更新时间支持 -->
    <script src="//cdn.jsdelivr.net/npm/docsify-updated@1/src/time-updater.min.js"></script>
    <!--字数统计-->
    <script src="//unpkg.com/docsify-count/dist/countable.min.js"></script>

    <!-- footer -->
    <script src="//cdn.jsdelivr.net/npm/@alertbox/docsify-footer/dist/docsify-footer.min.js"></script>

    <!--语法高亮-->
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-bash.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-c.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-cpp.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-csharp.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-go.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-go-module.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-cmake.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-lua.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-mermaid.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-protobuf.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-docker.min.js"></script>
    <script src="//cdn.jsdelivr.net/npm/prismjs@1/components/prism-java.min.js"></script>

    <!-- 实现离线化 -->
    <script>
      if (typeof navigator.serviceWorker !== "undefined") {
        navigator.serviceWorker.register("assets/docsify-sw.js");
      }
    </script>
  </body>
</html>
````

其中的docsify-sw.js为：

```javascript
/* ===========================================================
 * docsify sw.js
 * ===========================================================
 * Copyright 2016 @huxpro
 * Licensed under Apache 2.0
 * Register service worker.
 * ========================================================== */

const RUNTIME = 'docsify'
const HOSTNAME_WHITELIST = [
    self.location.hostname,
    'fonts.gstatic.com',
    'fonts.googleapis.com',
    'cdn.jsdelivr.net'
]

// The Util Function to hack URLs of intercepted requests
const getFixedUrl = (req) => {
    var now = Date.now()
    var url = new URL(req.url)

    // 1. fixed http URL
    // Just keep syncing with location.protocol
    // fetch(httpURL) belongs to active mixed content.
    // And fetch(httpRequest) is not supported yet.
    url.protocol = self.location.protocol

    // 2. add query for caching-busting.
    // Github Pages served with Cache-Control: max-age=600
    // max-age on mutable content is error-prone, with SW life of bugs can even extend.
    // Until cache mode of Fetch API landed, we have to workaround cache-busting with query string.
    // Cache-Control-Bug: https://bugs.chromium.org/p/chromium/issues/detail?id=453190
    if (url.hostname === self.location.hostname) {
        url.search += (url.search ? '&' : '?') + 'cache-bust=' + now
    }
    return url.href
}

/**
 *  @Lifecycle Activate
 *  New one activated when old isnt being used.
 *
 *  waitUntil(): activating ====> activated
 */
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim())
})

/**
 *  @Functional Fetch
 *  All network requests are being intercepted here.
 *
 *  void respondWith(Promise<Response> r)
 */
self.addEventListener('fetch', event => {
    // Skip some of cross-origin requests, like those for Google Analytics.
    if (HOSTNAME_WHITELIST.indexOf(new URL(event.request.url).hostname) > -1) {
        // Stale-while-revalidate
        // similar to HTTP's stale-while-revalidate: https://www.mnot.net/blog/2007/12/12/stale
        // Upgrade from Jake's to Surma's: https://gist.github.com/surma/eb441223daaedf880801ad80006389f1
        const cached = caches.match(event.request)
        const fixedUrl = getFixedUrl(event.request)
        const fetched = fetch(fixedUrl, { cache: 'no-store' })
        const fetchedCopy = fetched.then(resp => resp.clone())

        // Call respondWith() with whatever we get first.
        // If the fetch fails (e.g disconnected), wait for the cache.
        // If there’s nothing in cache, wait for the fetch.
        // If neither yields a response, return offline pages.
        event.respondWith(
            Promise.race([fetched.catch(_ => cached), cached])
                .then(resp => resp || fetched)
                .catch(_ => { /* eat any errors */ })
        )

        // Update the cache with the version we fetched (only for ok status)
        event.waitUntil(
            Promise.all([fetchedCopy, caches.open(RUNTIME)])
                .then(([response, cache]) => response.ok && cache.put(event.request, response))
                .catch(_ => { /* eat any errors */ })
        )
    }
})

```
