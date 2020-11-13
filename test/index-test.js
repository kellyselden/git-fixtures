'use strict';

const { describe } = require('./helpers/mocha');
const { expect } = require('./helpers/chai');
const {
  gitInit
} = require('../src');
const { createTmpDir } = require('../src/tmp');
const execa = require('execa');

describe(function() {
  beforeEach(async function() {
    this.tmpPath = await createTmpDir();
  });

  describe(gitInit, function() {
    it('works', async function() {
      await gitInit({
        cwd: this.tmpPath
      });

      let { stdout } = await execa('git', ['status'], { cwd: this.tmpPath });

      expect(stdout).to.include('No commits yet');
    });
  });
});
