import { ArgumentParser } from 'argparse';

const argsParser = new ArgumentParser({
  version: '0.0.1',
  addHelp: true,
  description: 'Discogs XMLs to Elasticsearch importer',
});

argsParser.addArgument(
  ['-d', '--date'],
  {
    help: 'Specify a Discogs date file. ex: 20170101',
  },
);

argsParser.addArgument(
  ['-f', '--file'],
  {
    choices: ['artist', 'master', 'release', 'label'],
    defaultValue: ['artist', 'master', 'release', 'label'],
    help: 'Specify a Discogs index to import',
  },
);

const args = argsParser.parseArgs();

if (args.date === null) {
  console.error('Date argument must be specified');
  process.exit(0);
}

if (typeof args.file === 'string') {
  args.file = [args.file];
}

args.files = args.file;
delete args.file;

export default args;
