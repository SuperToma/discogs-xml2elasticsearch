import { ArgumentParser } from 'argparse';

const argsParser = new ArgumentParser({
  add_help: true,
  description: 'Discogs XMLs to Elasticsearch importer',
});

argsParser.add_argument(
  '-d', '--date', {help: 'Specify a Discogs date file. ex: 20170101',},
);

argsParser.add_argument(
  '-f',
  '--file',
  {
    choices: ['artist', 'master', 'release', 'label'],
    default: ['artist', 'master', 'release', 'label'],
    help: 'Specify a Discogs index to import',
  },
);

const args = argsParser.parse_args();

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
