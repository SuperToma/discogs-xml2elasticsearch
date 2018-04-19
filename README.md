# discogs-xml2elasticsearch

This project is a importer of Discogs XMLs : https://data.discogs.com/
into Elasticsearch

It has been developed with Elasticsearch 6.2

Feel free to fork & upgrade.

## How it works : 

This will create an index for each files : 

  - artists
  - masters
  - releases

## Installation :

> npm install

Configure server Elasticsearch with file config/config.json

## Usage :

> npm run import -- -h

usage: boot.js [-h] [-v] [-d DATE] [-f {artists,masters,releases,labels}]

Discogs XMLs to Elasticsearch importer

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -d DATE, --date DATE  Specify a Discogs date file. ex: 20170101
  -f {artists,masters,releases,labels}, --file {artists,masters,releases,labels}
                        Specify a Discogs type to import
                        
## Todo 

implement labels :

 - Add labels in config.json
 - Add mapping in src/elasticsearch/mappings/labels.mapping.json

## Known bugs