'use babel';

import fs from 'fs';
import path from 'path';
import getPath from 'consistent-path';
import { spawnSync } from 'child_process';
import { CompositeDisposable, BufferedProcess } from 'atom';

const IS_WIN = process.platform === 'win32';
const NPM_COMMAND = IS_WIN ? 'npm.cmd' : 'npm';

const cache = {};
Cache.KISS_IS_INSTALLED = null;

function getKissGlobalPath() {
  if (Cache.KISS_IS_INSTALLED !== null) {
    return Cache.KISS_IS_INSTALLED;
  }
  try {
    const source = Object.assign({}, process.env);
    const options = { env: Object.assign(source, { PATH: getPath() }) };
    const command = spawnSync(NPM_COMMAND, ['root', '-g'], options);
    const prefixPath = command.output[1].toString().trim();
    const isUsingNVM = prefixPath.indexOf('/.nvm/');
    // NPM on platforms other than Windows
    const kissDirectory = path.join(prefixPath, 'kiss-cli');
    Cache.KISS_IS_INSTALLED = fs.statSync(kissDirectory).isDirectory();
    return Cache.KISS_IS_INSTALLED;
  } catch (e) {
    Cache.KISS_IS_INSTALLED = false;
    return Cache.KISS_IS_INSTALLED;
  }
}

const ERRORS = {
  INLINE: 'File must be saved first',
};

const Kiss = {
  subscriptions: null,

  activate() {
    const commands = atom.commands.add('atom-workspace', {
      'atom-kiss-cli:insert': this.insert,
    });
    // Register commands
    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(commands);
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {},

  insert() {
    // check if kiss is installed globally
    const kissIsInstalledGlobally = getKissGlobalPath();
    if (!kissIsInstalledGlobally) {
      const description = 'Atom Kiss Error';
      const message = 'Kiss should is not installed';
      const detail = 'Please use `npm i -g kiss-cli`';
      atom.notifications.addError(message, { description, detail });
      return;
    }
    const editor = atom.workspace.getActiveTextEditor();
    const isEditorContainsFile = editor && editor.buffer;
    if (!isEditorContainsFile) return;

    const { file } = editor.buffer;
    const currentSavedFilepath = (file && file.path) || false;
    if (!currentSavedFilepath) {
      const description = 'Atom Kiss Error';
      const message = 'File must be saved first';
      atom.notifications.addError(message, { description });
      return;
    }
    const userSelectedText = editor.getSelectedText();
    const processOptions = {
      args: ['--atom', userSelectedText, currentSavedFilepath],
      command: 'kiss',
      exit: code => {
        const numcode = parseInt(code, 10);
        if (numcode === 0) return;
        const description = 'Atom Kiss Error';
        const message = `Exited with ${code}`;
        atom.notifications.addError(message, { description });
      },
      stderr: message => {
        const description = 'Atom Kiss Error';
        atom.notifications.addError(message, { description });
      },
      stdout: output => {
        const editor = atom.workspace.getActiveTextEditor();
        editor.insertText(output);
        // const description = 'Atom Kiss Success';
        // const message = `Template ${userSelectedText} created`;
        // atom.notifications.addSuccess(message, { description });
      },
    };
    const runner = new BufferedProcess(processOptions);
  },
};

export default Kiss;
