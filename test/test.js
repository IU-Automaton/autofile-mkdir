/*global describe, it, before, beforeEach, after*/

'use strict';

var expect    = require('expect.js');
var fs        = require('fs');
var path      = require('path');
var rimraf    = require('rimraf');
var isDir     = require('./util/isDir');
var mkdir     = require('../autofile');
var automaton = require('automaton').create();

describe('mkdir', function () {
    var mode755_dir,
        mode777_dir;

    function clean(done) {
        rimraf(__dirname + '/tmp/', done);
    }

    before(function (done) {
        clean(function (err) {
            if (err) {
                throw err;
            }

            fs.mkdirSync(__dirname + '/tmp/');
            var target = __dirname + '/tmp/mkdir_dummy';

            // get the OS modes for dir
            fs.mkdirSync(target);
            mode777_dir = fs.statSync(target).mode;
            fs.chmodSync(target, '0755');
            mode755_dir = fs.statSync(target).mode;

            clean(done);
        });
    });
    beforeEach(function (done) {
        clean(function (err) {
            if (err) {
                throw err;
            }

            fs.mkdirSync(__dirname + '/tmp/');
            done();
        });
    });
    after(clean);

    it('should create directory - single depth folder', function (done) {
        var dir = __dirname + '/tmp/single_dir';

        automaton.run(mkdir, {
            dirs: dir
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(isDir(dir)).to.be(true);
            expect(fs.statSync(dir).mode).to.equal(mode777_dir);
            done();
        });
    });

    it('should create directory - multiple depth folder', function (done) {
        var dir = __dirname + '/tmp/multiple_dir/dir1/dir2';

        automaton.run(mkdir, {
            dirs: dir
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(isDir(dir)).to.be(true);
            expect(fs.statSync(dir).mode).to.equal(mode777_dir);
            expect(fs.statSync(path.dirname(dir)).mode).to.equal(mode777_dir);
            done();
        });
    });

    it('should accept a directory or an array of directories', function (done) {
        var dirs = [];
        dirs.push(__dirname + '/tmp/dirs/dir1');
        dirs.push(__dirname + '/tmp/dirs/dir2');
        dirs.push(__dirname + '/tmp/dirs/dir3/dir4');

        automaton.run(mkdir, {
            dirs: dirs
        }, function (err) {
            if (err) {
                throw err;
            }

            expect(isDir(dirs[0])).to.be(true);
            expect(isDir(dirs[1])).to.be(true);
            expect(isDir(dirs[2])).to.be(true);
            done();
        });
    });

    it('should create directories with desired mode', function (done) {
        var dirs = [];

        dirs.push(__dirname + '/tmp/mode/dir1');
        dirs.push(__dirname + '/tmp/mode/dir2');
        dirs.push(__dirname + '/tmp/mode/dir3');
        dirs.push(__dirname + '/tmp/mode/dir3/dir4');

        automaton.run(mkdir, {
            dirs: dirs,
            mode: '0755'
        }, function (err) {
            if (err) {
                throw err;
            }

            // verify if is dir
            expect(isDir(dirs[0])).to.be(true);
            expect(isDir(dirs[1])).to.be(true);
            expect(isDir(dirs[2])).to.be(true);
            expect(isDir(dirs[3])).to.be(true);

            // verify mode
            expect(fs.statSync(dirs[0]).mode).to.equal(mode755_dir);
            expect(fs.statSync(dirs[1]).mode).to.equal(mode755_dir);
            expect(fs.statSync(dirs[2]).mode).to.equal(mode755_dir);
            expect(fs.statSync(dirs[3]).mode).to.equal(mode755_dir);

            done();
        });
    });

    it('should error if target already exists', function (done) {
        var dir = __dirname + '/tmp/';

        automaton.run(mkdir, {
            dirs: dir,
            mode: '0755'
        }, function (err) {

            expect(err).to.be.an(Error);
            expect(err.message).to.match(/already exists/);

            done();
        });
    });
});
