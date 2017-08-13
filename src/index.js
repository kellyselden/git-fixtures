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
  gitInit(cwd) {
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
  }
};
