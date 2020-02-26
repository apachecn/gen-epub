var fs = require('fs')
var ejs = require('ejs')
var moment = require('moment')
var uuidGenerator = require('./uuid.js')
var jszip = require('jszip')
var path = require('path')

function d(fname) {
    
    return path.join(__dirname, fname)
}

function fnameEscape(name){
    
    return name.replace(/\\|\/|:|\*|\?|"|<|>|\|/g, '-')
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
    
    articleTemp = ejs.compile(articleTemp)
    for(var [i, art] of articles.entries()) {
        zip.file(`OEBPS/Text/${+i+1}.html`, articleTemp(art));
    }
    
    for(var [fname, data] of imgs.entries()) {
        zip.file(`OEBPS/Images/${fname}`, data);
    }
    
    var uuid = uuidGenerator.uuid();
    var htmlToc = articles.map((art, i) => ({
            title: art.title,
            file: `${+i+1}.html`,
    }))
    var imgToc = Array.from(imgs.keys())
        .map(fname => ({file: fname}))

    var co = ejs.render(contentTemp, {
        date: moment().format('YYYY-MM-DD'),
        imgToc: imgToc,
        htmlToc: htmlToc,
        uuid: uuid,
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
