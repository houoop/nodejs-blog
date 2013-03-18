var handlebars = require('handlebars'),
    async = require('async'),
    fs = require('fs'),
    mk=require('markdown'),
    pt=require('path'),
    config=require('./config.js'),
    zlib = require("zlib");

var router = function(req,res,path,param, postData,db) {
        var rootpath = /[^\/?]+/gi.exec(path);
        if (rootpath === null) {
            readIndexPost(res);
        } else {
            switch (rootpath[0]) {
            case 'post':
                readSinglePost(path, res,db);
                break;
            case 'edit':
                createNewPost(res);
                break;
            case 'savepost':
                savePost(res, postData,db);
                break;
            case 'SavePostSuccess':
                savePostSuccess(res,param);
                break;
            case 'assets':
                returnStaticFile(req,res,path);
                break;
            /*
             *case 'verify':
             *    userVerify(res,param);
             *    break;
             */
            default:
                Error404(res);
                break;
            }
        }
    };
var postdir = 'post';
var Error404=function (res) {
    res.writeHead(200, {
        'Content-Type': 'text/html;charset=utf8'
    });
    res.write('404');
    res.end();
};
var userVerify=function (res,param) {
    if(param.pwd&&param.pwd===config.config.user.pwd){
        res.writeHead(200,'verify success',{
            'Content-Type':'text/json;charset=utf8'
        });
        res.write('{result:true}');
        res.end();
    }
};
var returnStaticFile=function (req,res,path) {
    var ext=pt.extname(path).substr(1);
    if(MIME_TYPE[ext]===undefined){
        return;
    }
    var realPath=pt.normalize(__dirname+path.replace(/\.\./g,''));
    /*
     *var raw = fs.createReadStream(realPath);
     *var acceptEncoding = req.headers['accept-encoding'] || "";
     *var matched = ext.match(config.config.Compress.match);
     *if (matched && acceptEncoding.match(/\bgzip\b/)) {
     *    res.writeHead(200, "Ok", {
     *        'Content-Encoding': 'gzip'
     *    });
     *    raw.pipe(zlib.createGzip()).pipe(res);
     *} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
     *    res.writeHead(200, "Ok", {
     *        'Content-Encoding': 'deflate'
     *    });
     *    raw.pipe(zlib.createDeflate()).pipe(res);
     *} else {
     *    res.writeHead(200, "Ok");
     *    raw.pipe(res);
     *}
     */
    async.waterfall([function (callback) {
        fs.stat(realPath,function (err,stat) {
            var lastModified=stat.mtime.toUTCString();
            var ifModifiedSince = "If-Modified-Since".toLowerCase();
            res.writeHead("Last-Modified",lastModified);
            if(ext.match(config.config.expires.fileMatch)){
                var expires=new Date();
                expires.setTime(expires.getTime()+config.config.expires.maxAge*1000);
                res.writeHead('Expires',expires.toUTCString());
                res.writeHead('Cache-Control','max-age='+config.config.expires.maxAge);
            }
            console.log('lastModified'+lastModified);
            console.log('ifModifiedSince'+req.headers[ifModifiedSince]);
            if(req.headers[ifModifiedSince]&&lastModified==req.headers[ifModifiedSince]){
                res.writeHead(304,"Not Modified");
                res.end();
                return;
            }
            callback.call(null);
        });
    },function (callback) {
        console.log('读取静态文件'+path);
        fs.readFile(realPath, function(err, data) {
            if (err) {
                console.log(path);
                console.log(err);
                throw err;
            }

            res.writeHead(200, {
                'Content-Type': MIME_TYPE[ext]+';charset=utf8'
            });
            res.write(data);
            res.end();
            callback.call(null);
        });
    } ]);

};
var readIndexPost = function(res) {
        async.waterfall([

        function(callback) {
            fs.readdir(postdir, function(err, files) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log('read dir success');
                callback(null, files);
            });
        }, function(files, callback) {
            async.map(files, function readUtf8(file, callback) {
                fs.readFile(postdir + '/' + file, 'utf8', callback);
            }, function(err, results) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                for (var i = results.length - 1; i >= 0; i--) {
                    results[i] = JSON.parse(results[i]);
                    results[i].content=mk.markdown.toHTML(results[i].content);
                }
                callback(null, results);
            });
        }, function(result, callback) {
            fs.readFile('index.html', 'utf-8', function(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log('read index template');
                var template = handlebars.compile(data);
                if (result.length === 0) {
                    result[0] = {
                        title: 'no post',
                        content: 'no content'
                    };
                }
                callback(null, template({
                    post: result
                }));
            });
        }], function(err, content) {
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write(content);
            res.end();
        });
    };
var readSinglePost = function(path, res,db) {
        var fileID = (/[^\/post\/?]+/gi.exec(path))[0];
        console.log('fileID=' + fileID);
        var posts=db.posts;
        var address;
        for(var i=posts.length-1;i>=0;i--){
            if(posts[i].index==fileID){
                address=posts[i].fileAddress;
                break;
            }
        }
        if(address===undefined){
            Error404(res);
            return;
        }
        async.waterfall([

        function(callback) {
            fs.exists(address, function(exist) {
                if (!exist) {
                    console.log('no post find at' + postdir + '/' + fileID + '.post');
                    throw 'no post find';
                }
                callback(null);
            });
        }, function(callback) {
            fs.readFile(address, function(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                callback(null, JSON.parse(data));
            });
        }, function(result, callback) {
            fs.readFile('singlepage.html', 'utf-8', function(err, data) {
                if (err) {
                    console.log(err);
                    throw err;
                }
                console.log('read single template');
                var template = handlebars.compile(data);
                result.content=mk.markdown.toHTML(result.content);
                callback(null, template({
                    post: result
                }));
            });
        }], function(err, content) {
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write(content);
            res.end();
        });
    };
var createNewPost = function(res) {
        fs.readFile('newpost.html', 'utf-8', function(err, data) {
            if (err) {
                console.log(err);
                throw err;
            }
            res.writeHead(200, {
                'Content-Type': 'text/html;charset=utf8'
            });
            res.write(data);
            res.end();
        });
    };
var savePost = function(res, postData,db) {
        var address =postdir+'/'+ (new Date()).getTime() + ".post";
        var lastIndex = db.posts.length;
        async.waterfall([

        function(callback) {
            fs.writeFile(address, JSON.stringify(postData), function(err) {
                if (err) {
                    console.log("error to save post");
                }
                db.posts[lastIndex] = {
                    'index': lastIndex,
                    'fileAddress': address
                };
                callback.call(null);
            });
        },function (callback) {
            fs.writeFile('index.db',JSON.stringify(db),function (err) {
                if(err){
                    console.log("error to save index.db");
                    throw err;
                }
                callback.call(null);
            });
        }], function(err, result) {
            res.writeHead(302, {
                'Location': '/SavePostSuccess?id=' + lastIndex
            });
            res.end();
        });
    };
var savePostSuccess=function (res,param) {
    if(!!param.id&&typeof param.id==='number'){
        Error404(res);
        return;
    }
    fs.readFile('savepostsuccess.html', 'utf-8', function(err, data) {
        if (err) {
            console.log(err);
            throw err;
        }
        res.writeHead(200, {
            'Content-Type': 'text/html;charset=utf8'
        });
        res.write(data);
        res.end();
    });
};
MIME_TYPE = {
    "css": "text/css",
    "gif": "image/gif",
    "html": "text/html",
    "ico": "image/x-icon",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "js": "text/javascript",
    "json": "application/json",
    "pdf": "application/pdf",
    "png": "image/png",
    "svg": "image/svg+xml",
    "swf": "application/x-shockwave-flash",
    "tiff": "image/tiff",
    "txt": "text/plain",
    "wav": "audio/x-wav",
    "wma": "audio/x-ms-wma",
    "wmv": "video/x-ms-wmv",
    "xml": "text/xml"
};
exports.router = router;
