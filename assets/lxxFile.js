/*
 * lxxFile.js html5 file 上传组件
 * by Xinxing Li at 2018-10-16
 * 参考了 ZXXFile
*/
// Vue.component('file-upload', { /* ... */ })
var app = new Vue({
  el: '#app',
  data: {
    url: "./upload",						//ajax地址
    fileFilter: [],					//过滤后的文件数组
    isHover:false,
    isDrag:false,
  },
  methods: {
    readFile: function (file) {
      return new Promise((resolve, reject) => {
        var reader = new FileReader()
        reader.onload = e => {
          resolve(e.target.result)
        }
        reader.onerror = e => {
          reject('readFile error!')
        }
        reader.readAsDataURL(file)
      })
    },
    onDelete: function () { },		//文件删除后
    onDragOver: function (e) {
      //文件拖拽到敏感区域时
      this.isDrag = true;
      var classList = e.target.classList.toString()
      if(classList.indexOf('area') != -1){
        e.dataTransfer.dropEffect = "copy";
        this.isHover = true;
      }
      else{
        e.dataTransfer.dropEffect = "none";
        this.isHover = false;
      }
    },	
    onProgress: function () { },		//文件上传进度
    onSuccess: function () { },		//文件上传成功时
    onFailure: function () { },		//文件上传失败时,
    onComplete: function () { },		//文件全部上传完毕时
    /* 开发参数和内置方法分界线 */
    //获取选择文件，file控件或拖放
    funGetFiles: async function (e) {
      this.isHover = false;
      this.isDrag = false;
      // 获取文件列表对象
      var files = e.target.files || e.dataTransfer.files;
      //继续添加文件
      for (var i = 0; i < files.length; i++) {
        files[i].result = await this.readFile(files[i])
        this.fileFilter.push(files[i])
      }
    },

    //删除对应的文件
    funDeleteFile: function (fileDelete) {
      var arrFile = [];
      for (var i = 0, file; file = this.fileFilter[i]; i++) {
        if (file != fileDelete) {
          arrFile.push(file);
        } else {
          this.onDelete(fileDelete);
        }
      }
      this.fileFilter = arrFile;
      return this;
    },

    //文件上传
    funUploadFile: function () {
      var self = this;
      for (var i = 0, file; file = this.fileFilter[i]; i++) {
        (function (file) {
          var xhr = new XMLHttpRequest();
          if (xhr.upload) {
            // 上传中
            xhr.upload.addEventListener("progress", function (e) {
              self.onProgress(file, e.loaded, e.total);
            }, false);
            // 文件上传成功或是失败
            xhr.onreadystatechange = function () {
              console.log(`[lxxFile.js funUploadFile]:xhr.readyState:${xhr.readyState} xhr.status:${xhr.status} xhr.reponseText:\n${xhr.responseText}`)
              if (xhr.readyState == 4) {
                if (xhr.status == 200) {
                  self.onSuccess(file, xhr.responseText);
                  self.funDeleteFile(file);
                  if (!self.fileFilter.length) {
                    //全部完毕
                    self.onComplete();
                  }
                } else {
                  self.onFailure(file, xhr.responseText);
                }
              }
            };
            // 开始上传
            xhr.open("POST", self.url, true);
            xhr.setRequestHeader("FILENAME", encodeURIComponent(file.name));
            var newForm = new FormData();
            newForm.append("file", file)
            xhr.send(newForm);
          }
        })(file);
      }

    },
  }
})

