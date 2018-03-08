'use babel';

import AtomKissCliView from './atom-kiss-cli-view';
import { CompositeDisposable, BufferedProcess } from 'atom';

export default {
  subscriptions: null,

  activate(state) {
    this.atomKissCliView = new AtomKissCliView(state.atomKissCliViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.atomKissCliView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register commands
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-kiss-cli:insert': () => this.insert(),
        'atom-kiss-cli:templates': () => this.templates()
      })
    );
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.atomKissCliView.destroy();
  },

  serialize() {
    return {
      atomKissCliViewState: this.atomKissCliView.serialize()
    };
  },

  temlates() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor) return;
  },

  insert() {
    const editor = atom.workspace.getActiveTextEditor();
    if (!editor || !editor.buffer || !editor.buffer.file) return;
    // FIXME -> if file does not exists
    // warn the user he must saved the file before using atom-kiss-cli
    const command = 'kiss';
    const filepath = (editor.buffer.file && editor.buffer.file.path) || '';
    const selection = editor.getSelectedText();
    const args = [selection, '--atom', filepath];
    const stdout = output => editor.insertText(`${output}`);
    const exit = code =>
      console.log(`atom-kiss-cli: ${selection} --atom exited with ${code}`);
    const process = new BufferedProcess({ command, args, stdout, exit });
  }
};
