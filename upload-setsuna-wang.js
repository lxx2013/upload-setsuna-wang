const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const Router = require('koa-router')
const serve = require('koa-static')
const koaBody = require('koa-body');


var router = new Router()
router.get('/', ctx => {
    console.log(`path${ctx.request.path}`)
    if (ctx.request.accepts('html')) {
        ctx.response.type = 'text/html'
        ctx.response.body = fs.readFileSync(__dirname + '/index.html')
    }
})

const path = require('path');
router.post('/upload', async function (ctx) {
    const outputDir = path.join(__dirname, 'static');
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir);
    }
    const filePaths = [];
    const files = ctx.request.body.files || ctx.request.files || {};
    console.log(files);
    for (let key in files) {
        const file = files[key];
        var filePath = path.join(outputDir, file.name);
        filePath = HashFileName(filePath);
        const reader = fs.createReadStream(file.path);
        const writer = fs.createWriteStream(filePath);
        reader.pipe(writer);
        filePaths.push(filePath);
    }
    ctx.body = {
        status:'success',
        filePaths:filePaths.map(x=>x.replace(/\/.*\//,'https://i.setsuna.wang/'))
    };
})

//阮一峰错误处理函数 , 全局 try catch http://www.ruanyifeng.com/blog/2017/08/koa.html
const handler = async (ctx, next) => {
    try {
        await next();
    } catch (err) {
        ctx.response.status = err.statusCode || err.status || 500;
        ctx.response.body = {
            status: 'error',
            message: err.message
        };
    }
};
app.use(handler)
app.use(koaBody({
    multipart: true,
    formidable: {
        maxFileSize: 2 * 1024 * 1024	// 设置上传文件大小最大限制，默认2M
    }
}));
app.use(router.routes())
app.use(router.allowedMethods())
app.use(serve(__dirname))
app.listen(8200, () => {
    console.log('koa is listening on 8200...');
})

//检查文件是否存在,若不存在则返回原文件及路径名,若已存在则递增序号
function HashFileName(path){
    if(!fs.existsSync(path)) return path;
    var i = 2;
    /(.*)\.([^\.]+)/.test(path)
    var name = RegExp.$1,type = RegExp.$2;
    while(fs.existsSync(name+i+'.'+type)){
        i++;
    }
    return name+i+'.'+type;
}