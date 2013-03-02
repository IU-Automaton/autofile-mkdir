'use strict';

var mkdirp = require('mkdirp');
var fs     = require('fs');
var path   = require('path');
var async  = require('async');

module.exports = function (task) {
    task
    .id('mkdir')
    .name('Make directory')
    .description('Make directory recursively, just like `mkdir -p`')
    .author('Indigo United')

    .option('dirs', 'The directory you want to create. Accepts a directory or an array of directories.')
    .option('mode', 'The directory permissions.', '0777')

    .setup(function (opt, ctx, next) {
        if (typeof opt.mode !== 'number') {
            opt.mode = parseInt(opt.mode, 8);
        }
        next();
    })
    .do(function (opt, ctx, next) {
        var dirs = Array.isArray(opt.dirs) ? opt.dirs : [opt.dirs];
        var error;

        async.forEach(dirs, function (dir, next) {
            dir = path.normalize(dir);

            fs.stat(dir, function (err) {
                if (!err || err.code !== 'ENOENT') {
                    error = new Error('EEXIST, target already exists \'' + dir + '\'');
                    error.code = 'EEXISTS';
                    return next(error);
                }

                mkdirp(dir, opt.mode, next);
            });
        }, next);
    });
};