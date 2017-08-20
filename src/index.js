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
    let cwd = typeof options === 'object' ? options.cwd : options;

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
    let tag = options.tag || 'v1';
    let cwd = options.cwd;

    run('git add -A', {
      cwd
    });

    run(`git commit -m "${tag}"`, {
      cwd
    });

    run(`git tag ${tag}`, {
      cwd
    });
  }
};
