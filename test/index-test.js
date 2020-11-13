'use strict';

const { describe } = require('./helpers/mocha');
const { expect } = require('./helpers/chai');
const {
  gitInit
} = require('../src');
const { createTmpDir } = require('../src/tmp');
const execa = require('execa');

describe(function() {
  describe(gitInit, function() {
    it('works with cwd', async function() {
      let cwd = await createTmpDir();

      await gitInit({
        cwd
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
});
