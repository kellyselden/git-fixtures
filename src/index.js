'use strict';

const cp = require('child_process');
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
  }
};
