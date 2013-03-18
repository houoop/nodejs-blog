var http=require('http'),
    url=require('url'),
    qs=require('querystring'),
    router=require('./router.js'),
    fs=require('fs');


var db=JSON.parse(fs.readFileSync('index.db','utf-8'));
function onRequest(req,res){
    res.setHeader("name1",1);
    res.setHeader("name2",2);
    res.writeHead(200,'tst');
    res.write('111111111111');
    res.end();

}
http.createServer(onRequest).listen(8888);