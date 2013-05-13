var rss = require('rss');
var cache=require('./cache.js');
var posts=cache.db.posts.reverse();
var feed = new rss({
        title: 'HOUOOP\'s Blog',
        description: 'HOUOOP\'s Blog',
        feed_url: 'http://www.houoop.com/atom.xml',
        site_url: 'http://www.houoop.com',
        image_url: 'http://www.houoop.com/assets/img/favicon.ico',
        author: 'zhangyang'
    });
for (var i = posts.length - 1; i >= 0; i--) {
    feed.item({
        title:  posts[i].title,
        description: posts[i].content,
        url: 'http://www.houoop.com/post/'+posts[i].index,
        author: 'houoop',
        date: posts[i].ctime
    });
};
var xml=feed.xml();
exports.rss=xml;