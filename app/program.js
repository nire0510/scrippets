const commander = require('commander');
const actions = require('./actions');
const dict = require('../config/dictionary.json');
const pkg = require('../package.json');

require('colors');

/**
 * Initializes program
 * @param {*} args Command arguments
 * @returns {undefined}
 */
commander.run = (args) => {
  commander
    .version(pkg.version)
    .description(pkg.description)
    .option('-C, --chdir <path>', dict.program.commands.chdir.description)
    .option('-w, --website', dict.program.commands.website.description)
    .on('website', actions.website)
    .on('chdir', actions.chdir)
    .on('--help', actions.help);

  commander
    .command('<alias>=<command>')
    .description(dict.program.commands.upsert.description)
    .option('-d, --description <description>', dict.program.commands.upsert.options.description)
    .action(actions.upsert);

  commander
    .command('move <from> [to]')
    .alias('mv')
    .description(dict.program.commands.move.description)
    .option('-d, --description <description>', dict.program.commands.move.options.description)
    .action(actions.move);

  commander
    .command('copy <from> <to>')
    .alias('cp')
    .option('-g, --global', dict.program.commands.copy.options.global)
    .description(dict.program.commands.copy.description)
    .action(actions.copy);

  commander
    .command('list [filter]')
    .alias('ls')
    .description(dict.program.commands.list.description)
    .option('-c, --command', dict.program.commands.list.options.command)
    .option('-g, --global', dict.program.commands.list.options.global)
    .action(actions.list);

  commander
    .command('remove [alias...]')
    .alias('rm')
    .option('-r, --recursive', dict.program.commands.remove.options.recursive)
    .option('-f, --force', dict.program.commands.remove.options.force)
    .description(dict.program.commands.remove.description)
    .action(actions.remove);

  commander
    .command('execute <alias>')
    .alias('ex')
    .option('-d, --dry', dict.program.commands.execute.options.dry)
    .option('-g, --global', dict.program.commands.execute.options.global)
    .option('-p, --params <params...>', dict.program.commands.execute.options.params)
    .description(dict.program.commands.execute.description)
    .action(actions.execute);

  commander
    .command('*')
    .action(() => {
      // assume execute:
      if (commander.rawArgs.length === 3 && commander.rawArgs[2].indexOf('=') === -1) {
        actions.execute(commander.rawArgs[2], {});
      }
      // assume upsert:
      else {
        let arrAlias;
        let strAlias;
        let strCommand;
        const objOptions = {};

        // extract arguments:
        for (let i = 2; i < commander.rawArgs.length; i++) {
          if (commander.rawArgs[i].indexOf('=') !== -1) {
            arrAlias = commander.rawArgs[i].split('=');
            strAlias = arrAlias[0];
            strCommand = arrAlias[1];
          }
          // has description:
          else if ((commander.rawArgs[i] === '-d' || commander.rawArgs[i] === '--description') &&
            i + 1 < commander.rawArgs.length) {
            objOptions.description = commander.rawArgs[i + 1];
          }
        }

        if (strAlias && strCommand) {
          actions.upsert(strAlias, strCommand, objOptions);
        }
        else {
          console.error(dict.program.commands.common.messages.commandnotfound.red);
        }
      }
    });

  // parse args:
  commander.parse(args);
  // display help if no args passed:
  if (!commander.args.length && !commander.chdir) {
    commander.help();
  }
};

module.exports = commander;
