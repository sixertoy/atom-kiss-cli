'use babel';

import { CompositeDisposable, BufferedProcess } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-kiss-cli:insert': () => this.insertTemplate()
      })
    );
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  serialize() {
    return {};
  },

  insertTemplate() {
    let editor;
    if ((editor = atom.workspace.getActiveTextEditor())) {
      let selection = editor.getSelectedText();
      const command = 'kiss';
      const args = [selection, '--atom'];
      const stdout = output => editor.insertText(`${output}`);
      const exit = code => console.log(`kiss dumb --atom exited with ${code}`);
      const process = new BufferedProcess({ command, args, stdout, exit });
    }
  }
};
