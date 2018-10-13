# upload-setsuna-wang
>使用原生 JS 的前端 + koa2搭建一个拖拽文件上传的服务接口,用作学习练手以及自己使用的图床

## 接口设计 *可参考 sm.ms*

## 计划
- [ ] 初始时使用手写简单 html 和原生 js 完成:
  - [ ] 文件上传接口
  - [ ] 拖拽相关操作
  - [ ] 图床上的图片链接
- [ ] [laobubu](https://github.com/laobubu)提出的根据一个 url 拿到需打印文档的服务,例如在打印店里访问`http://xx.firefox.com/fileName.doc`来打印
- [ ] 图片切割 `image?width=200&height=200/webp`
- [ ] 后期前端页面切换为`vuetify`+`nuxt`
- [ ] 增加第三方的图床 API
  - [ ] sm.ms
  - [ ] 七牛云
  - [ ] 针对三家图床API(包括自己)使用图标颜色来标注 `宕机` or `正常服务中`

## 总结
#### 0. 绑定`document.querySelector` 到`$`
直接赋值后运行会报错, 报错的原因是 `querySelectorAll` 所需的执行上下文必需是 `document`，而我们赋值到 `$` 调用后上下文变成了全局 `window` ,正确的应该是
```js
var $  = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
```
需要注意的地方是，这些方法返回的要么是单个 Node 节点，要么是 NodeList 而 NodeLis 是类数组的对象，但并不是真正的数组，所以拿到之后不能直接使用 map,forEach 等方法。正确方法:
```js
Array.prototype.map.call(document.querySelectorAll('button'),function(element,index){
    element.onclick = function(){
    }
})
```
#### 1.FileList 对象获取
目前只能通过`表单选择文件`或者`拖拽文件`或者`剪切板事件`
```js
document.querySelector('input').onchange = function() {
  console.log(this.files);
};
//或者拖拽事件
var ipt = document.querySelector('textarea');
ipt.ondragover = function () { return false; };
ipt.ondrop = function(e) {
  e.stopPropagation();
  e.preventDefault();
  e = e || window.event;
  var files = e.dataTransfer.files;
  console.log(files);
};
```
#### 2. FileList中的 File 对象属性
- `name`：文件名，该属性只读。
- `size`：文件大小，单位为字节，该属性只读。
- `type`：文件的 MIME 类型，如果分辨不出类型，则为空字符串，该属性只读。
- `lastModified`：文件的上次修改时间，格式为时间戳。
- `lastModifiedDate`：文件的上次修改时间，格式为 Date 对象实例。

#### 3. FileReader 对象
- `readAsText(Blob|File, opt_encoding)`：返回文本字符串。默认情况下，文本编码格式是’UTF-8’，可以通过可选的格式参数，指定其他编码格式的文本。
- 事件
  - `onabort`事件：读取中断或调用reader.abort()方法时触发。
  - `onerror`事件：读取出错时触发。
  - `onload`事件：读取成功后触发。
  - `onloadend`事件：读取完成后触发，不管是否成功。触发顺序排在 onload 或 onerror 后面。
  - `onloadstart`事件：读取将要开始时触发。
  - `onprogress`事件：读取过程中周期性触发
## 参考文档
- [鑫空间/安兹·乌尔·恭的超位魔法-任意拖拽](https://www.zhangxinxu.com/wordpress/2018/09/drag-drop-datatransfer-js/)
- [掘金 Koa2文件上传下载](https://juejin.im/post/5abc451ff265da23a2292dd4)
- [HTML5 File API — 让前端操作文件变的可能](https://www.cnblogs.com/zichi/p/html5-file-api.html)