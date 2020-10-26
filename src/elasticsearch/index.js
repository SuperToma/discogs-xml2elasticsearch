import Elasticsearch from '@elastic/elasticsearch';
import fs from 'fs';
import util from 'util';
import config from '../../config/config.json';

const EsClient = new Elasticsearch.Client({
  node: `http://${config.elasticsearch.host}:${config.elasticsearch.port}`,
  // log: 'trace'
});

EsClient.sleep = async (ms) => new Promise(res => setTimeout(res, ms));

EsClient.checkAll = async function (indexes) {
  await EsClient.checkping().catch(console.log);
  for (const indexName of indexes) {
    await EsClient.checkIndex(indexName).catch(console.log);
  }
};

EsClient.checkping = async function () {
  const result = await EsClient.ping();

  if (result.statusCode === 200) {
    console.log('Elasticsearch cluster is up!');
    return;
  }
  console.error('elasticsearch cluster is down!');
  console.log(result)
  process.exit(1);
};

EsClient.createIndex = async function (indexName) {
  console.log(`Creating index ${indexName}...`);

  try {
    await EsClient.indices.create({
      index: indexName,
      body: {
        settings: {
          number_of_shards: config.elasticsearch.nb_of_shards,
          number_of_replicas: config.elasticsearch.nb_of_replicas,
          index: {
            analysis: {
              filter: {},
              analyzer: {
                edge_ngram_analyzer: {
                  filter: [
                    'lowercase',
                  ],
                  tokenizer: "edge_ngram_tokenizer",
                },
                edge_ngram_search_analyzer: {
                  tokenizer: "lowercase",
                },
              },
              tokenizer: {
                edge_ngram_tokenizer: {
                  type: "edge_ngram",
                  min_gram: 2,
                  max_gram: 30,
                  token_chars: [
                    "letter",
                  ],
                },
              },
            },
          },
        },
      },
    });

    console.log(`Index ${indexName} created !`);
  } catch (err) {
    if (err.meta.body.status === 400) {
      console.log(`Index ${indexName} already exists`);
    } else {
      console.log(`Failed to create index ${indexName}:`);
      console.log(err.meta.body);
      process.exit(1);
    }
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

  try {
    await EsClient.indices.putMapping({
      index: indexName,
      body: mapping,
    });
    console.log(`Mapping for index ${indexName} created !`);
  } catch (err) {
    console.error(`Failed to create mapping for index ${indexName}:`);
    console.log(err.meta.body);
    process.exit(1);
  }
};

EsClient.sendBulk = async function (bulk) {
  let count = 0;
  const maxTries = 3;

  await EsClient.bulk({ body: bulk });

  /* Working but not necessary
  while (true) {
    try {
      await EsClient.bulk({ body: bulk });
      break;
    } catch (err) {
      // 429: overloaded es_rejected_execution_exception
      if (err.meta.statusCode === 429) {
        count++;
        if (count > maxTries) {
          console.log('Script aborded after 5 Elasticsearch bulk attempts');
          process.exit(1);
        } else {
          console.log(`Server overloaded, retry ${count}/5 in 3 seconds...`);
          await EsClient.sleep(3000);
        }
      } else {
        console.error(`Bulk failed:\n<<<<<<<<<<<<<<<<`);
        console.log(util.inspect(bulk, false, null));
        console.log('>>>>>>>>>>>>>>>>');
        console.log(util.inspect(err, false, null));
        process.exit(1);
      }
    }
  } */
};

export default EsClient;
