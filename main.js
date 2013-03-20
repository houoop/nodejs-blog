var http=require('http'),
    url=require('url'),
    qs=require('querystring'),
    router=require('./router.js');


function onRequest(req,res){

    var data="";
    var path=url.parse(req.url,true).pathname;
    var param=qs.parse(url.parse(req.url,true).query);
    console.log("Request for " + path + " received.");
    req.setEncoding('utf8');
    req.addListener("data", function(postData) {
        data += postData;
        console.log("Received POST data chunk '"+ postData + "'.");
    });
    req.addListener("end", function() {
        if(typeof data==='string'){
            data=qs.parse(data);
        }
        router.router(req,res,path,param, data);
    });
}
http.createServer(onRequest).listen(80);
