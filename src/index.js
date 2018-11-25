'use strict';

const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const fixturify = require('fixturify');
const debug = require('debug')('git-fixtures');

const branchName = 'foo';
const branchRegExp = new RegExp(`^\\* ${branchName}\\r?\\n {2}master$`);

function run(command, options) {
  debug(command);
  let result = cp.execSync(command, options).toString();
  debug(result);
  return result;
}

function gitStatus(options) {
  return run('git status --porcelain', options);
}

function processExit({
  promise,
  cwd,
  commitMessage,
  noGit,
  expect
}) {
  return promise.then(result => ({ result })).catch(stderr => {
    if (typeof stderr !== 'string') {
      throw stderr;
    }

    expect(stderr).to.not.contain('Error:');
    expect(stderr).to.not.contain('fatal:');
    expect(stderr).to.not.contain('Command failed');

    return { stderr };
  }).then(obj => {
    if (!noGit) {
      let result = run('git log -1', {
        cwd
      });

      // verify it is not committed
      expect(result).to.contain('Author: Your Name <you@example.com>');
      expect(result).to.contain(commitMessage);

      result = run('git branch', {
        cwd
      });

      // verify branch was deleted
      expect(result.trim()).to.match(branchRegExp);

      let status = gitStatus({
        cwd
      });

      obj.status = status;
    }

    return obj;
  });
}

function processIo({
  ps,
  cwd,
  commitMessage,
  expect
}) {
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
      processExit({
        promise: Promise.reject(stderr),
        cwd,
        commitMessage,
        expect
      }).then(resolve);
    });
  });
}

module.exports = {
  gitInit({
    cwd
  }) {
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

  commit({
    m = 'initial commit',
    tag,
    cwd
  }) {
    run('git add -A', {
      cwd
    });

    // allow no changes between tags
    if (gitStatus({
      cwd
    })) {
      run(`git commit -m "${m}"`, {
        cwd
      });
    }

    if (tag) {
      run(`git tag ${tag}`, {
        cwd
      });
    }
  },

  postCommit({
    cwd,
    dirty
  }) {
    // non-master branch test
    run(`git checkout -b ${branchName}`, {
      cwd
    });

    if (dirty) {
      fs.writeFileSync(path.join(cwd, 'a-random-new-file'), 'bar');
    }
  },

  processBin({
    binFile,
    args = [],
    cwd,
    commitMessage,
    expect
  }) {
    binFile = path.join(process.cwd(), 'bin', binFile);

    args = [binFile].concat(args);

    let ps = cp.spawn('node', args, {
      cwd,
      env: process.env
    });

    let promise = processIo({
      ps,
      cwd,
      commitMessage,
      expect
    });

    return {
      ps,
      promise
    };
  },

  processIo,

  processExit,

  fixtureCompare({
    expect,
    actual,
    expected
  }) {
    actual = fixturify.readSync(actual);
    expected = fixturify.readSync(expected);

    delete actual['.git'];
    delete actual['node_modules'];

    expect(actual).to.deep.equal(expected);
  }
};
