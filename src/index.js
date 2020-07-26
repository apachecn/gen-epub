#!/usr/bin/env node

var fs = require('fs')
var ejs = require('ejs')
var moment = require('moment')
var uuid = require('uuid')
var jszip = require('jszip')
var path = require('path')
var {Command} = require('commander')
var pkg = require('../package.json');

var isImg = s => /\.(jpg|jpeg|gif|png|bmp|webp|tiff)$/.test(s)

function d(fname) {
    
    return path.join(__dirname, fname)
}

function fnameEscape(name){
    
    return name.replace(/\\|\/|:|\*|\?|"|<|>|\|/g, '-')
}

function calcDigitCount(l) {
    
    return (l == 0)? 1: Math.floor(Math.log10(l)) + 1
}

function writeEpub(articles, imgs, name, path) {
    
    name = name || articles[0].title
    path = path || fnameEscape(name) + '.epub'
    if(!path.endsWith('.epub')) path += '.epub'
    
    var mimetype = fs.readFileSync(d('./assets/mimetype'))
    var container = fs.readFileSync(d('./assets/container.xml'))
    var style = fs.readFileSync(d('./assets/Style.css'))
    var articleTemp = fs.readFileSync(d('assets/article.ejs'), 'utf-8')
    var contentTemp = fs.readFileSync(d('assets/content.ejs'), 'utf-8')
    var tocTemp = fs.readFileSync(d('assets/toc.ejs'), 'utf-8')
    
    var zip = new jszip();
    zip.file('mimetype', mimetype);
    zip.file('META-INF/container.xml', container);
    zip.file('OEBPS/Styles/Style.css', style);
    
    var l = calcDigitCount(articles.length)
    articleTemp = ejs.compile(articleTemp)
    for(var [i, art] of articles.entries()) {
        var padNum = i.toString().padStart(l, '0')
        zip.file(`OEBPS/Text/${padNum}.html`, articleTemp(art));
    }
    
    for(var [fname, data] of imgs.entries()) {
        zip.file(`OEBPS/Images/${fname}`, data);
    }
    
    var uuid_ = uuid.v4();
    var htmlToc = articles.map((art, i) => ({
            title: art.title,
            file: i.toString().padStart(l, '0') + '.html',
    }))
    var imgToc = Array.from(imgs.keys())
        .map(fname => ({file: fname}))

    var co = ejs.render(contentTemp, {
        date: moment().format('YYYY-MM-DD'),
        imgToc: imgToc,
        htmlToc: htmlToc,
        uuid: uuid_,
        name: name,
    });
    zip.file('OEBPS/content.opf', co);

    var toc = ejs.render(tocTemp, {
        toc: htmlToc,
        uuid: uuid,
    });
    zip.file('OEBPS/toc.ncx', toc);
    
    if(!zip.generate)
        throw ReferenceError('please install the sync version of jszip')
    var data = zip.generate({base64: false, compression:'DEFLATE'})
    fs.writeFileSync(path, data, 'binary')
}

module.exports = writeEpub

function main() {
    var args = new Command()
        .version(pkg.version)
        .arguments('<articleFile>', 'JSON file of article')
        .option('-i, --imgs <imgDir>', 'image dir')
        .option('-n, --name <name>', 'name of epub, default as the title of the first article')
        .option('-p, --path <path>', 'path of epub, default as the current dir')
        .parse()
        
    var articleFile = args.args[0]
    if(!fs.existsSync(articleFile) || 
       !articleFile.endsWith('.json')) {
           console.log('JSON file not found')
           return
    }
    var articles = JSON.parse(fs.readFileSync(articleFile, 'utf-8'))
    
    var imgs = new Map()
    if(args.imgs) {
        if(!fs.statSync(args.imgs).isDirectory()) {
            console.log('img dir not found')
            return
        }
        var files = fs.readdirSync(args.imgs)
            .filter(isImg)
        for(var f of files) {
            fullf = path.join(args.imgs, f)
            var img = fs.readFileSync(fullf)
            imgs.set(f, img)
        }
    }
    
    writeEpub(articles, imgs, args.name, args.path)
}

if(require.main === module) main()
