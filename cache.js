var fs = require('fs'),
handlebars = require('handlebars'),
mk = require('markdown');
var rss = require('rss');
var db = {
	posts: []
};
Array.prototype.remove = function(b) {
	var a = this.indexOf(b);
	if (a >= 0) {
		this.splice(a, 1);
		return true;
	}
	return false;
};
var template = {
	indexPage: fs.readFileSync('template/indexPage.html', 'utf-8'),
	singlePage: fs.readFileSync('template/singlePage.html', 'utf-8')
};
var formatDate = function(time) {
    return [time.getFullYear(), '-', time.getMonth() + 1, '-', time.getDate(), ' ', time.getHours(), ':', time.getMinutes(), ':', time.getSeconds()].join('');
};
fs.readdir('posts', function(err, files) {
	if (err) {
		throw err;
	}
	for (var i = files.length - 1; i >= 0; i--) {
		var splitIndex = files[i].indexOf('-');
		var content=fs.readFileSync('posts/' + files[i], 'utf-8');
		db.posts[i] = {
			title: files[i].slice(splitIndex + 1, - 3),
			content: mk.markdown.toHTML(content),
			lessContent: mk.markdown.toHTML(content.slice(0,content.indexOf('###',200))),
			index: files[i].slice(0, splitIndex),
			ctime: formatDate(fs.statSync('posts/'+files[i]).ctime)
		};
		console.log(db.posts[i].title + '------' + db.posts[i].index);
		var singlePageHtml = template.singlePage;
		db.posts[i].html = handlebars.compile(singlePageHtml)({
			post: db.posts[i]
		});
		console.log('读取' + files[i]);
		if (splitIndex === - 1) {
			db.posts.splice(i,1);
            continue;
		}
		if (files[i].slice( - 3) !== '.md') {
			db.posts.splice(i,1);
            continue;
		}
	}
	var indexHtml = template.indexPage;
	db.index = handlebars.compile(indexHtml)({
		post: db.posts.sort(function(a, b) {
			return b.index - a.index;
		})

	});
	db.posts.reverse();
	var feed = new rss({
	        title: 'HOUOOP\'s Blog',
	        description: 'HOUOOP\'s Blog',
	        feed_url: 'http://www.houoop.com/feed',
	        site_url: 'http://www.houoop.com',
	        image_url: 'http://www.houoop.com/assets/img/favicon.ico',
	        author: 'zhangyang'
	    });
	for(var i=0,l=db.posts.length;i<l;i++){
	    feed.item({
	        title:  db.posts[i].title,
	        description: db.posts[i].content,
	        url: 'http://www.houoop.com/post/'+db.posts[i].index,
	        author: 'houoop',
	        date: db.posts[i].ctime
	    });
	    console.log(db.posts[i].title);
	}
	var xml=feed.xml();
	console.log('read to cache');
	exports.feed=xml;
	exports.db = db;
	exports.template = template;
});


