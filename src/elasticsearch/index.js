import Elasticsearch from 'elasticsearch';
import fs from 'fs';
import util from 'util';
import config from '../../config/config.json';

const EsClient = new Elasticsearch.Client({
  host: `${config.elasticsearch.host}:${config.elasticsearch.port}`,
  // log: 'trace'
});

EsClient.checkAll = async function (indexes) {
  await EsClient.checkping();
  for (const indexName of indexes) {
    await EsClient.checkIndex(indexName);
  }
};

EsClient.checkping = async function () {
  const result = await EsClient.ping({ requestTimeout: 500 });

  if (result === true) {
    console.log('Elasticsearch cluster is up!');
  } else {
    console.error('elasticsearch cluster is down!');
    process.exit(1);
  }
};

EsClient.createIndex = async function (indexName) {
  console.log(`Creating index ${indexName}...`);

  const result = await EsClient.indices.create({
    index: indexName,
    body: {
      settings: {
        number_of_shards: config.elasticsearch.nb_of_shards,
        number_of_replicas: config.elasticsearch.nb_of_replicas,
      },
    },
  });

  if (result.acknowledged === true) {
    console.log(`Index ${indexName} created !`);
  } else {
    console.error('elasticsearch cluster is down!');
    process.exit(1);
  }
};

EsClient.checkIndex = async function (indexName) {
  const indexExists = await EsClient.indices.exists({ index: indexName });

  if (indexExists === true) {
    console.log(`Index ${indexName} exists`);
  } else {
    await EsClient.createIndex(indexName);
  }

  const mappingFilePath = `./src/elasticsearch/mappings/${indexName}.mapping.json`;

  if (fs.existsSync(mappingFilePath) === false) {
    console.error(`ERROR : Elasticsearch mapping file not found : ${mappingFilePath}`);
  }

  const readFile = util.promisify(fs.readFile);
  const mapping = await readFile(mappingFilePath, "utf8");

  console.log(`Creating/updating mapping for index ${indexName} ...`);

  const result = await EsClient.indices.putMapping({
    index: indexName,
    type: 'master',
    body: mapping,
  });

  if (result.acknowledged === true) {
    console.log(`Mapping for index ${indexName} created !`);
  } else {
    console.error(`Failed to create mapping for index ${indexName}`);
    process.exit(1);
  }
};

EsClient.sendBulk = function (bulk) {
  EsClient.bulk({
    body: bulk,
  }, (error, resp) => {
    if (resp.error) {
      console.log('>>>');
      console.log(util.inspect(bulk, false, null));
      console.log('<<<');
      console.log(util.inspect(resp, false, null));
      process.exit(1);
    }
  });
};

export default EsClient;

