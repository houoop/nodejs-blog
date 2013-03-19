var fs = require('fs'),
mk = require('markdown');
var db={posts:[]};
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
		db.posts[i]={
            title:files[i].slice(0,-3),
            content:mk.markdown.toHTML(fs.readFileSync('posts/' + files[i],'utf-8'))
        };
        console.log('读取'+files[i]);
	}
});
console.log('read to cache');
exports.db = db;
exports.template = template;

