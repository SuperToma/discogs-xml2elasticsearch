import args from './argsparser';
import Downloader from './Downloader';
import EsClient from './elasticsearch';
import Xmlparser from './Xmlparser';

async function run () {
  await EsClient.checkAll(args.files);
  await new Downloader(args.date, args.files).getDiscogsFiles();
  await new Xmlparser(args.date, args.files).importData();
}

run();

