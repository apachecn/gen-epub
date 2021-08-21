#!/usr/bin/env python3.7
# -*- coding: utf-8 -*-

"""GenEpub
https://github.com/apachecn/gen-epub"""

import zipfile
import uuid
import re
from os import path
import jinja2
from datetime import datetime
from io import BytesIO

__author__ = "ApacheCN"
__email__ = "apachecn@163.com"
__license__ = "SATA"
__version__ = "2021.8.20.1"

is_img = lambda s: re.search(r'\.(jpg|jpeg|gif|png|bmp|webp|tiff)$', s)

d = lambda name: path.join(path.dirname(__file__), name) 

def fname_escape(name):
    return re.sub(r'\\|\/|:|\*|\?|"|<|>|\|', '-', name)

def gen_epub(articles, imgs=None, name=None, path=None):
    imgs = imgs or {}
    name = name or articles[0]['title']
    path = path or fname_escape(name) + '.epub'
    if not path.endswith('.epub'):
        path += '.epub'
        
    mimetype = open(d('./assets/mimetype'), 'rb').read()
    container  = open(d('./assets/container.xml'), 'rb').read()
    style = open(d('./assets/Style.css'), 'rb').read()
    articleTemp = open(d('./assets/article.j2'), encoding='utf-8').read()
    contentTemp = open(d('./assets/content.j2'), encoding='utf-8').read()
    tocTemp = open(d('./assets/toc.j2'), encoding='utf-8').read()
    
    bio = BytesIO()
    zip = zipfile.ZipFile(bio, 'w', zipfile.ZIP_DEFLATED)
    zip.writestr('mimetype', mimetype)
    zip.writestr('META-INF/container.xml', container)
    zip.writestr('OEBPS/Styles/Style.css', style)
    
    l = len(str(len(articles)))
    articleTemp = jinja2.Template(articleTemp)
    for i, art in enumerate(articles):
        pad_num = str(i).zfill(l)
        zip.writestr(f'OEBPS/Text/{pad_num}.html', 
            articleTemp.render(**art).encode('utf-8'))
        
    for fname, img in imgs.items():
        zip.writestr(f'OEBPS/Images/{fname}', img)
        
    uuid_ = uuid.uuid4().hex
    html_toc = [
        {
            'title': art['title'],
            'file': str(i).zfill(l) + '.html',
        } 
        for i, art in enumerate(articles)
    ]
    img_toc = [
        {'file': fname}
        for fname in imgs
    ]
    
    co = jinja2.Template(contentTemp) \
        .render(
            date=datetime.now().strftime('%Y-%m-%d'),
            img_toc=img_toc,
            html_toc=html_toc,
            uuid=uuid_,
            name=name,
        )
    zip.writestr('OEBPS/content.opf', co.encode('utf-8'))
    
    toc = jinja2.Template(tocTemp) \
        .render(toc=html_toc, uuid=uuid_)
    zip.writestr('OEBPS/toc.ncx', toc.encode('utf-8'))
    
    zip.close()
    data = bio.getvalue()
    open(path, 'wb').write(data)
    
    
    