var config = {};
config.expires = {
    fileMatch: /^(gif|jpg|png|js|css)$/ig,
    maxAge: 60 * 60 * 34 * 365
};
config.Compress = {
    match: /css|js|html/ig
};
config.user = {
    psd: 'abcd'
};
exports.config = config;

