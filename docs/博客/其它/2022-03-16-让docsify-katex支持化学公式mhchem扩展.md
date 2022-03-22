在使用docsify构建Markdown文档时，如果想要支持数学公式，可以使用docsify-katex插件，但是该插件不支持化学公式mhchem扩展，比如下面的代码：

````code
```math
\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\underset{\text{amphoteres Hydroxid}}{\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\underset{\text{Hydroxozikat}}{\ce{[Zn(OH)4]^2-}}$}
```
````

正常显示应该为：

$$
\ce{Zn^2+  <=>[+ 2OH-][+ 2H+]  $\underset{\text{amphoteres Hydroxid}}{\ce{Zn(OH)2 v}}$  <=>[+ 2OH-][+ 2H+]  $\underset{\text{Hydroxozikat}}{\ce{[Zn(OH)4]^2-}}$}
$$

docsify-katex已经很久没更新了(笔者已经提交了PR，且已经被合并了，最新版本已经支持了），最新的katex已经支持mhchem扩展。为了让docsify-katex也支持mhchem扩展，需要做如下修改：

首先引入mhchem扩展

```javascript
import 'katex/contrib/mhchem/mhchem';
```

由于mhchem扩展的语法格式中包含有美元符号，与行内公式使用的标记一样，所以需要先处理掉块内的美元符号：
再定义：

```javascript
const blockDollar = '!!blockDollar!!';
const blockDollarRegx = /!!blockDollar!!/g;
```

再把处理公式块内的美元符号处理掉：
将hook.beforeEach函数如原代码：

```javascript
// Block
.replace(/(\$\$)([\s\S]*?)(\$\$)/g, function (a, b, c) {
   return preMathBlockOpen + c + preMathBlockClose;
})
```

改为：

```javascript
// Block
.replace(/(\$\$)([\s\S]*?)(\$\$)/g, function (a, b, c) {
   let x = c.replace(/\$/g, blockDollar)
   return preMathBlockOpen + x + preMathBlockClose;
})
```

再修改hook.afterEach函数中原代码：

```javascript
mathRendered = mathRendered
  .replace(
    preMathBlockRegex,
    function (m, code) {
      let rendered = katex.renderToString(code, blockOptions);
      return rendered;
      }
);
```

修改为：

```javascript
mathRendered = mathRendered
  .replace(
    preMathBlockRegex,
    function (m, code) {
      code = code.replace(blockDollarRegx, '$')
      let rendered = katex.renderToString(code, blockOptions);
      return rendered;
      }
);
```

即可。
修改好源码后，编译，使用新编译的js代码即可。
