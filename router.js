var handlebars = require('handlebars'),
async = require('async'),
fs = require('fs'),
mk = require('markdown'),
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
		case 'edit':
			createNewPost(res);
			break;
		case 'savepost':
			savePost(res, postData);
			break;
		case 'SavePostSuccess':
			savePostSuccess(res, param);
			break;
		case 'assets':
			returnStaticFile(req, res, path);
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
var Error404 = function(res) {
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write('404');
	res.end();
};
var userVerify = function(res, param) {
	if (param.pwd && param.pwd === config.config.user.pwd) {
		res.writeHead(200, 'verify success', {
			'Content-Type': 'text/json;charset=utf8'
		});
		res.write('{result:true}');
		res.end();
	}
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
	var html = cache.template.header + cache.template.sidebar + cache.template.indexPage + cache.template.footer;
	var template = handlebars.compile(html);
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write(template({
		post: cache.db.posts
	}));
	res.end();
};
var readSinglePost = function(path, res) {
	var fileID = (/[^\/post\/?]+/gi.exec(path))[0];
	console.log('fileID=' + fileID);
	if (cache.db.posts[fileID - 1] === undefined) {
		Error404(res);
		return;
	}
	var html = cache.template.header + cache.template.sidebar + cache.template.singlePage + cache.template.footer;
	var template = handlebars.compile(html);
	res.writeHead(200, {
		'Content-Type': 'text/html;charset=utf8'
	});
	res.write(template({
		post: cache.db.posts[fileID - 1]
	}));
	res.end();
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
var savePost = function(res, postData) {
	var lastIndex = cache.db.posts.length;
	cache.db.posts[lastIndex] = {
		'index': lastIndex,
		'title': postData.title,
		'content': mk.markdown.toHTML(postData.content)
	};
	fs.writeFile('index.db', JSON.stringify(cache.db), function(err) {
		if (err) {
			console.log("error to save index.db");
			throw err;
		}
		res.writeHead(302, {
			'Location': '/SavePostSuccess?id=' + ( lastIndex + 1 )
		});
		res.end();
	});
};
var savePostSuccess = function(res, param) {
	if ( !! param.id && typeof param.id === 'number') {
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

