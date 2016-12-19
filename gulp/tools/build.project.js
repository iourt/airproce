var fs = require('fs'),
	exclude = ['stand', 'config', 'themes'];

module.exports = function(callback) {
    var arr = [];
    fs.readdir(process.cwd() +'/source', function (err, files) {
        if (err) {
            console.log(err);
            return;
        }

        files.forEach(function (filename) {
            var stats = fs.lstatSync('source/'+ filename);

            if (stats.isDirectory() && !/\./.test(filename)) {
                
                if (exclude.length > 0) {

                    var buff = false;

                    exclude.forEach(function (prj) {
                        if (prj == filename) {
                            buff = true;
                        }
                    });

                    if (!buff) {
                        arr.push(filename);
                    }

                } else {

                    arr.push(filename);

                }
            }
        });

        callback(arr);
    });
};