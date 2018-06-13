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

1. Run 
> npm install

2. Configure your Elasticsearch configuration in file config/config.json

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
                        
Example command : 

> npm run import -- --d 20170101 -f master
                        
## Todo 

implement labels import :

 - Add labels in config.json
 - Add mapping in src/elasticsearch/mappings/labels.mapping.json

## Known bugs

 - Memory leak on Debian 9 while downloading Discogs files.
 
You can download them manually :

```
cd downloads
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2018/discogs_20180601_artists.xml.gz
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2018/discogs_20180601_masters.xml.gz
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2018/discogs_20180601_releases.xml.gz
```
