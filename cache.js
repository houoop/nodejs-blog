var fs = require('fs'),
handlebars = require('handlebars'),
mk = require('markdown');
handlebars.registerHelper('index', function(index) {
	return index + 1;
});
var db = {
	posts: []
};
var template = {
	header: fs.readFileSync('template/header.html', 'utf-8'),
	footer: fs.readFileSync('template/footer.html', 'utf-8'),
	sidebar: fs.readFileSync('template/sidebar.html', 'utf-8'),
	indexPage: fs.readFileSync('template/indexPage.html', 'utf-8'),
	singlePage: fs.readFileSync('template/singlePage.html', 'utf-8')
};
fs.readdir('posts', function(err, files) {
	if (err) {
		throw err;
	}
	for (var i = files.length - 1, a = 0; a <= i; a++) {
		var splitIndex = files[a].indexOf('-');
        if(splitIndex===-1){
            continue;
        }
		db.posts[a] = {
			title: files[a].slice(splitIndex + 1, - 3),
			content: mk.markdown.toHTML(fs.readFileSync('posts/' + files[a], 'utf-8')),
			index: files[a].slice(0, splitIndex)
		};
		console.log(db.posts[a].title + '------' + db.posts[a].index);
		var singlePageHtml = template.header + template.sidebar + template.singlePage + template.footer;
		db.posts[a].html = handlebars.compile(singlePageHtml)({
			post: db.posts[a]
		});
		console.log('读取' + files[a]);
	}
	var indexHtml = template.header + template.sidebar + template.indexPage + template.footer;
	db.posts = db.posts.sort(function(a, b) {
		return b.index - a.index;
	});
	db.index = handlebars.compile(indexHtml)({
		post: db.posts
	});
});
console.log('read to cache');
exports.db = db;
exports.template = template;

