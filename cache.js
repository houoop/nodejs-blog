var fs = require('fs'),
    handlebars = require('handlebars'),
    mk = require('markdown');
//缓存post数据
var db = {
    posts: []
};
//合并包含include 的模板
var getFullHTML=function(filepath){
    var reg=/<% include (.*) %>/gi;
    var content=fs.readFileSync(filepath, 'utf-8');
    return content.replace(reg,function(m,$1){
        return fs.readFileSync($1, 'utf-8');
    });
}
// 缓存模板文件
var template = {
    indexPage: getFullHTML('template/index.html'),
    singlePage: getFullHTML('template/singlePage.html'),
    archives:getFullHTML('template/archives.html')
};
//读取posts文件目录
var postsFiles=fs.readdirSync('posts');
for (var i = postsFiles.length - 1; i >= 0; i--) {
    var content=fs.readFileSync('posts/' + postsFiles[i], 'utf-8');
    //匹配index,post title和create date
    var matchs=/(\d+)-(.*?)-\((.*)\)/.exec(postsFiles[i]);
    if(!matchs[1]||!matchs[2]||!matchs[3]){
        continue;
    }
    db.posts[i] = {
        title: matchs[2],
        content: mk.markdown.toHTML(content),
        //摘要内容
        lessContent: mk.markdown.toHTML(content.slice(0,content.indexOf('###',200))),
        index: matchs[1],
        ctime: matchs[3]
    };
    //handlerbar 编译singlePage模板文件
    db.posts[i].html = handlebars.compile(template.singlePage)({
        post: db.posts[i]
    });
}
//将post按照index大小排序
db.posts=db.posts.sort(function(a, b) {
    return b.index - a.index;
});
//handlerbar 编译index模板文件
db.index = handlebars.compile(template.indexPage)({
    posts: db.posts
});
//handlerbar 编译archives模板文件
//按照年月对文章分类
var groupByDate=[];
for (var i = 0,l=db.posts.length - 1; i <=l; i++) {
    // 按照年月分类
    console.log(db.posts[i].title);
    var date=(/\d+-\d+/.exec(db.posts[i].ctime))[0];
    console.log(date);
    var existDate=false;
    for(var x in groupByDate){
        if(groupByDate[x].date===date){
            groupByDate[x].posts.push(db.posts[i]);
            existDate=true;
            break;
        }
    }
    if(!existDate){
        groupByDate.push({
            date:date,
            posts:[db.posts[i]]
        });
    }
};
console.dir(groupByDate);
db.archives = handlebars.compile(template.archives)({
    archives:groupByDate
});

console.log('read to cache');
exports.db = db;
exports.template = template;



