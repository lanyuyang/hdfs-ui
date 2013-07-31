/*
 * GET home page.
 */


var WebHDFS = require('../lib/webhdfs')

exports.index = function (req, res) {
    var path = req.query.p || '/'

    client = new WebHDFS();

    client.list(path, function (err, data) {
            res.render('index', {
                    title:'HDFS',
                    paths:path.replace(/(^\/*)|(\/*$)/g, "").split('/'),
                    data:data
                }
            );
        }
    )

}
;


exports.download = function (req, res) {
    var path = req.query.p || '/'

    client = new WebHDFS();
    var file = client.get(path)

    var head = {'Content-Type':'application/octet-stream',
        'Content-disposition':'attachment; filename=' + file.name, 'Transfer-Encoding':'chunked' }
    res.writeHead(200, head)

    file.req.pipe(res)

};