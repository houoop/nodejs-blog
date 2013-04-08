var async = require('async'),
fs = require('fs'),
pt = require('path'),
config = require('./config.js'),
zlib = require("zlib"),
cache = require('./cache.js');
var router = function(req, res, path, param, postData) {
	var rootpath = /[^\/?]+/gi.exec(path);
	if (rootpath === null) {
		readIndexPost(res);
	} else {
		switch (rootpath[0]) {
		case 'post':
			readSinglePost(path, res);
			break;
		case 'assets':
			returnStaticFile(req, res, path);
			break;
		case 'feed':
			rssFeed(res);
			break;
		default:
			Error404(res);
			break;
		}
	}
};
var postdir = 'post';
var Error404 = function(res) {
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write('<h1>我已经焕然一新了</h1><script>setTimeout(function(){location.href="/"},2000)</script>');
	res.end();
};
var rssFeed = function(res) {
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write(cache.feed);
	res.end();
};
var returnStaticFile = function(req, res, path) {
	var ext = pt.extname(path).substr(1);
	if (MIME_TYPE[ext] === undefined) {
		return;
	}
	var realPath = pt.normalize(__dirname + path.replace(/\.\./g, ''));
	/*
     *var raw = fs.createReadStream(realPath);
     *var acceptEncoding = req.headers['accept-encoding'] || "";
     *var matched = ext.match(config.config.Compress.match);
     *if (matched && acceptEncoding.match(/\bgzip\b/)) {
     *    res.statusCode=200;
     *    res.setHeader('Content-Encoding','gzip');
     *    raw.pipe(zlib.createGzip()).pipe(res);
     *} else if (matched && acceptEncoding.match(/\bdeflate\b/)) {
     *    res.statusCode=200;
     *    res.setHeader('Content-Encoding','deflate');
     *    raw.pipe(zlib.createDeflate()).pipe(res);
     *} else {
     *    res.statusCode=200;
     *    raw.pipe(res);
     *}
     */
	async.waterfall([function(callback) {
		fs.stat(realPath, function(err, stat) {
			var lastModified = stat.mtime.toUTCString();
			var ifModifiedSince = "If-Modified-Since".toLowerCase();
			res.setHeader("Last-Modified", lastModified);
			if (ext.match(config.config.expires.fileMatch)) {
				var expires = new Date();
				expires.setTime(expires.getTime() + config.config.expires.maxAge * 1000);
				res.setHeader('Expires', expires.toUTCString());
				res.setHeader('Cache-Control', 'max-age=' + config.config.expires.maxAge);
			}
			console.log('lastModified' + lastModified);
			console.log('ifModifiedSince' + req.headers[ifModifiedSince]);
			if (req.headers[ifModifiedSince] && lastModified == req.headers[ifModifiedSince]) {
				res.writeHead(304, "Not Modified");
				res.end();
				return;
			}
			callback.call(null);
		});
	},
	function(callback) {
		console.log('读取静态文件' + path);
		fs.readFile(realPath, function(err, data) {
			if (err) {
				console.log(path);
				console.log(err);
				throw err;
			}

			res.writeHead(200, {
				'Content-Type': MIME_TYPE[ext] + ';charset=utf8'
			});
			res.write(data);
			res.end();
			callback.call(null);
		});
	}]);

};
var readIndexPost = function(res) {
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write(cache.db.index);
	res.end();
};
var readSinglePost = function(path, res) {
	var fileID = (/[^\/post\/?]+/gi.exec(path))?(/[^\/post\/?]+/gi.exec(path))[0]:null;
    if(fileID===null){
        Error404(res);
        return;
    }
	console.log('fileID=' + fileID);
	if (cache.db.posts[fileID - 1] === undefined) {
		Error404(res);
		return;
	}
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write(cache.db.posts[fileID-1].html);
	res.end();
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

