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
    
    var zip = new jszip();
    zip.file('mimetype', fs.readFileSync(d('./assets/mimetype')));
    zip.file('META-INF/container.xml', fs.readFileSync(d('./assets/container.xml')));
    zip.file('OEBPS/Styles/Style.css', fs.readFileSync(d('./assets/Style.css')));
    
    var articleTemp = ejs.compile(fs.readFileSync(d('assets/article.ejs'), 'utf-8'))
    
    var htmlToc = []
    var imgToc = []
    
    for(var [i, art] of Object.entries(articles)) {
        zip.file(`OEBPS/Text/${+i+1}.html`, articleTemp(art));
        
        htmlToc.push({
            title: art.title,
            file: `${+i+1}.html`,
        })
    }
    
    for(var [name, data] of imgs.entries()) {
        zip.file(`OEBPS/Images/${name}`, data);
        
        imgToc.push({
            file: name,
        })
    }
    
    var uuid = uuidGenerator.uuid();
    
    var opf = ejs.render(fs.readFileSync(d('assets/content.ejs'), 'utf-8'), {
        date: moment().format('YYYY-MM-DD'),
        imgToc: imgToc,
        htmlToc: htmlToc,
        uuid: uuid,
        name: name,
    });
    zip.file('OEBPS/content.opf', opf);

    var ncx = ejs.render(fs.readFileSync(d('assets/toc.ejs'), 'utf-8'), {
        toc: htmlToc,
        uuid: uuid,
    });
    zip.file('OEBPS/toc.ncx', ncx);
    
    zip.generateAsync({type: 'nodebuffer', 'compression':'DEFLATE'})
       .then(co => fs.writeFileSync(path, co))
}

module.exports = writeEpub