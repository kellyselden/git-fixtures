'use strict';

const { describe } = require('./helpers/mocha');
const { expect } = require('./helpers/chai');
const {
  gitInit,
  cloneRemote,
} = require('../src');
const { createTmpDir } = require('../src/tmp');
const execa = require('execa');

describe(function() {
  describe(gitInit, function() {
    it('works with cwd', async function() {
      let cwd = await createTmpDir();

      await gitInit({
        cwd,
      });

      let { stdout } = await execa('git', ['status'], { cwd });

      expect(stdout).to.include('nothing to commit');
    });

    it('works without cwd', async function() {
      let cwd = await gitInit();

      let { stdout } = await execa('git', ['status'], { cwd });

      expect(stdout).to.include('nothing to commit');

      expect(cwd).to.startWith(require('os').tmpdir());
    });
  });

  describe(cloneRemote, function() {
    beforeEach(async function() {
      this.localPath = await gitInit();
    });

    it('works with remotePath', async function() {
      let remotePath = await createTmpDir();

      await cloneRemote({
        localPath: this.localPath,
        remotePath,
      });

      let localCommit = (await execa('git', ['rev-list', '-n', '1', 'HEAD'], { cwd: this.localPath })).stdout;
      let remoteCommit = (await execa('git', ['rev-list', '-n', '1', 'HEAD'], { cwd: remotePath })).stdout;

      expect(remoteCommit).to.equal(localCommit);
    });

    it('works without remotePath', async function() {
      let remotePath = await cloneRemote({
        localPath: this.localPath,
      });

      let localCommit = (await execa('git', ['rev-list', '-n', '1', 'HEAD'], { cwd: this.localPath })).stdout;
      let remoteCommit = (await execa('git', ['rev-list', '-n', '1', 'HEAD'], { cwd: remotePath })).stdout;

      expect(remoteCommit).to.equal(localCommit);

      expect(remotePath).to.startWith(require('os').tmpdir());
    });
  });
});
