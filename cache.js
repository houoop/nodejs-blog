var fs = require('fs'),
handlebars = require('handlebars'),
mk = require('markdown');
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
	for (var i = files.length - 1; i >= 0; i--) {
		var splitIndex = files[i].indexOf('-');
		if (splitIndex === - 1) {
			continue;
		}
		db.posts[i] = {
			title: files[i].slice(splitIndex + 1, - 3),
			content: mk.markdown.toHTML(fs.readFileSync('posts/' + files[i], 'utf-8')),
			index: files[i].slice(0, splitIndex)
		};
		console.log(db.posts[i].title + '------' + db.posts[i].index);
		var singlePageHtml = template.header + template.sidebar + template.singlePage + template.footer;
		db.posts[i].html = handlebars.compile(singlePageHtml)({
			post: db.posts[i]
		});
		console.log('读取' + files[i]);
	}
	var indexHtml = template.header + template.sidebar + template.indexPage + template.footer;
	db.index = handlebars.compile(indexHtml)({
		post: db.posts.sort(function(a, b) {
			return b.index - a.index;
		})

	});
    db.posts.reverse();
});
console.log('read to cache');
exports.db = db;
exports.template = template;

