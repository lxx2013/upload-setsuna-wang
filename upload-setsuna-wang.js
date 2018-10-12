const Koa = require('koa')
const fs = require('fs')
const app = new Koa()
const Router = require('koa-router')
const serve = require('koa-static')
const koaBody = require('koa-body');


var router = new Router()
router.get('/', ctx => {
    console.log(ctx.request)
    console.log(`path${ctx.request.path}`)
    if (ctx.request.accepts('html')) {
        ctx.response.type = 'text/html'
        ctx.response.body = fs.readFileSync(__dirname + '/index.html')
    }
})
router.post('/upload', async (ctx) => {
    try {
        const file = ctx.request.files.file;	// 获取上传文件
        const reader = fs.createReadStream(file.path);	// 创建可读流
        const ext = file.name.split('.').pop();		// 获取上传文件扩展名
        const upStream = fs.createWriteStream(`upload/${Math.random().toString()}.${ext}`);		// 创建可写流
        reader.pipe(upStream);	// 可读流通过管道写入可写流
        return ctx.body = JSON.stringify({
            status: 'succuss',
            message: '上传成功',
        })
    }
    catch (err) {
        return ctx.body = JSON.stringify({
            status: 'error',
            message: err,
            log:ctx.request
        },null,2)
    }
})

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