# gen-epub

用于生成 EPUB 的小工具。

## 安装

通过 npm（推荐）：

```
npm install gen-epub
```

从源码安装：

```
npm install git+https://github.com/apachecn/gen-epub
```

## 导入

```js
const genEpub = require('gen-epub')
```

## 函数参考

```js
genEpub(articles, imgs, name, path)
```

+   `articles: [{title: String, content: String}]`
    
    文章列表，每个文章以对象表示，`title`属性为标题（纯文本），`content`属性为正文（HTML）。
    
    在正文中引用图片时，将`<img>`的`src`属性设为`../Images/{文件名}`。
    
+   `imgs: Map{String: Buffer}`

    图片字典，键为文件名，值为图片二进制数据。
    
+   `name: String`

    在书籍元信息中显示的书名，默认为`articles[0].title`。
    
+   `path: String`

    保存文件的路径名，默认为当前工作目录下的`name + '.epub'`。

## 协议

本项目基于 SATA 协议发布。

您有义务为此开源项目点赞，并考虑额外给予作者适当的奖励。

## 赞助我们

![](https://home.apachecn.org/img/about/donate.jpg)

## 另见

+   [ApacheCN 学习资源](https://docs.apachecn.org/)
+   [计算机电子书](http://it-ebooks.flygon.net)
+   [布客新知](http://flygon.net/ixinzhi/)
