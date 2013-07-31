/*
 * GET home page.
 */


var WebHDFS = require('../lib/webhdfs'),
    config = require('../etc/config.json')

exports.index = function (req, res) {
    var path = req.query.p || '/'

    client = new WebHDFS();

    client.list(path, function (err, data) {
            res.render('index', {
                    title:config.title,
                    paths:path.replace(/(^\/*)|(\/*$)/g, "").split('/'),
                    data:data
                }
            );
        }
    )

};

exports.download = function (req, res) {
    var path = req.query.p

    client = new WebHDFS();
    var file = client.get(path)

    var head = {'Content-Type':'application/octet-stream',
        'Content-disposition':'attachment; filename=' + file.name, 'Transfer-Encoding':'chunked' }
    res.writeHead(200, head)

    file.req.pipe(res)

};

exports.preview = function (req, res) {

    var path = req.query.p

    client = new WebHDFS();
    client.preview(path, function (err, content) {
        res.json({
            content:content
        })
    })

}