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

    // Register command that toggles this view
    this.subscriptions.add(
      atom.commands.add('atom-workspace', {
        'atom-kiss-cli:insert': () => this.insert()
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

  insert() {
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
