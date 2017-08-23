'use strict';

const cp = require('child_process');
const fixturify = require('fixturify');
const debug = require('debug')('git-fixtures');

function run(command, options) {
  debug(command);
  let result = cp.execSync(command, options).toString();
  debug(result);
  return result;
}

module.exports = {
  gitInit(options) {
    let cwd = options.cwd;

    run('git init', {
      cwd
    });

    run('git config user.email "you@example.com"', {
      cwd
    });

    run('git config user.name "Your Name"', {
      cwd
    });

    run('git config merge.tool "vimdiff"', {
      cwd
    });

    run('git config mergetool.keepBackup false', {
      cwd
    });
  },

  commit(options) {
    let m = options.m || 'initial commit';
    let tag = options.tag;
    let cwd = options.cwd;

    run('git add -A', {
      cwd
    });

    run(`git commit -m "${m}"`, {
      cwd
    });

    if (tag) {
      run(`git tag ${tag}`, {
        cwd
      });
    }
  },

  processIo(options) {
    let ps = options.ps;
    let cwd = options.cwd;
    let expect = options.expect;

    return new Promise(resolve => {
      ps.stdout.on('data', data => {
        let str = data.toString();
        if (str.includes('Normal merge conflict')) {
          ps.stdin.write(':%diffg 3\n');
          ps.stdin.write(':wqa\n');
        } else if (str.includes('Deleted merge conflict')) {
          ps.stdin.write('d\n');
        }
      });

      let stderr = '';

      ps.stderr.on('data', data => {
        stderr += data.toString();
      });

      ps.stderr.pipe(process.stdout);

      ps.on('exit', () => {
        let status = run('git status', {
          cwd
        });

        expect(stderr).to.not.contain('Error:');
        expect(stderr).to.not.contain('fatal:');
        expect(stderr).to.not.contain('Command failed');

        let result = run('git log -1', {
          cwd
        });

        // verify it is not committed
        expect(result).to.contain('Author: Your Name <you@example.com>');
        expect(result).to.contain('add files');

        result = run('git branch', {
          cwd
        });

        // verify branch was deleted
        expect(result.trim()).to.match(/\* foo\r?\n {2}master/);

        resolve({
          status,
          stderr
        });
      });
    });
  },

  fixtureCompare(options) {
    let expect = options.expect;
    let actual = options.actual;
    let expected = options.expected;

    actual = fixturify.readSync(actual);
    expected = fixturify.readSync(expected);

    delete actual['.git'];
    delete actual['node_modules'];

    expect(actual).to.deep.equal(expected);
  }
};
