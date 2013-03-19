var fs=require('fs');
var db=JSON.parse(fs.readFileSync('index.db','utf-8'));
var template={
    header:fs.readFileSync('header.html','utf-8'),
    footer:fs.readFileSync('footer.html','utf-8'),
    sidebar:fs.readFileSync('sidebar.html','utf-8'),
    indexPage:fs.readFileSync('indexPage.html','utf-8'),
    singlePage:fs.readFileSync('singlePage.html','utf-8')
};
console.log('read to cache');
exports.db=db;
exports.template=template;
