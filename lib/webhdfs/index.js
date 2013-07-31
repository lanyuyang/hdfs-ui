//var request = require('request').defaults({'proxy':'http://localhost:8888'}),
var request = require('request')
    _ = require('underscore'),
    fs = require('fs'),
    Path = require('path'),
    zlib = require('zlib')
    ;

var _webHDFS = {
    host:'localhost',
    port:50070,
    base:'user/public/',
    getAPIBase:function () {
        return ["http://", this.host, ":", this.port, "/webhdfs/v1/" ].join('')
    },
    getAPIPath:function (op, path, params) {
        params = params || {}
        params.op = op

        var qs = []
        _.each(params, function (value, key) {
            qs.push(key + '=' + encodeURIComponent(value))
        })

        var paramPath = path.replace(/(^\/*)|(\/*$)/g, "");
        var path = [this.getAPIBase(), this.base, paramPath, '?', qs.join('&')].join('')
        console.log(path)
        return path
    }
};

var WebHDFS = function (config) {
    config = config || {}
    if (config.host)
        _webHDFS.host = config.host

    if (config.port)
        _webHDFS.port = config.port
}

WebHDFS.prototype = {
    list:function (path, callback) {

        var op = "LISTSTATUS";
        request(_webHDFS.getAPIPath(op, path), function (error, response, body) {
            var res = JSON.parse(body)
            res = (res.FileStatuses && res.FileStatuses.FileStatus) || []

            _.each(res, function (i) {
                i.path = (path === '/') ? '/' + i.pathSuffix : path + '/' + i.pathSuffix
            })
            if (typeof callback === 'function')
                callback(error, res)
        });
    },
    get:function (path) {

        var op = "OPEN"
        var filename = Path.basename(path)
        return {
            name:filename,
            req:request({
                url:_webHDFS.getAPIPath(op, path)
            })
        }
    },
    preview:function (path, callback) {

        var op = "OPEN"
        var filename = Path.basename(path)

        var out = fs.createWriteStream('out.txt');
        console.log('preview')
        var obj = request({
            url:_webHDFS.getAPIPath(op, path, {'length':'4096'})
        }).pipe(zlib.createGunzip())


        var ret = ''
        obj.on('data', function (data) {
            ret += data.toString()
        })

        obj.on('end', function () {
            if (typeof callback === 'function')
                callback(null, ret)
        })


        /*
         function (err, response, body) {
         console.log(body)

         if (filename.match(/\.gz$/)) {
         zlib.gunzip(new Buffer(body, 'binary'), function () {
         console.log('gunzip')

         console.log(arguments)
         })
         } else {
         if (typeof callback === 'function')
         callback(err, body)
         }

         })
         */

    }

}


module.exports = WebHDFS