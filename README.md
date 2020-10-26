# discogs-xml2elasticsearch

This project is a importer of Discogs XMLs : https://data.discogs.com/
into Elasticsearch

Compatible with Elasticsearch 7.0.0 or later

Feel free to fork & upgrade.

## How it works :

This will create an index for each files :

  - artists
  - masters
  - releases

## Installation :

1. Run
```
npm install
```

2. Configure your Elasticsearch configuration in file config/config.json

## Usage :

```
npm run import -- -h
```

usage: boot.js [-h] [-v] [-d DATE] [-f {artists,masters,releases,labels}]

Discogs XMLs to Elasticsearch importer

Optional arguments:
```
  -h, --help            Show this help message and exit.

  -v, --version         Show program's version number and exit.


  -d DATE, --date DATE  Specify a Discogs date file. ex: 20170101

  -f {artists,masters,releases,labels}, --file {artists,masters,releases,labels}
                        Specify a Discogs index to import
```

Example command :

```
npm run import -- --d 20170101 -f master
```

## Todo

implement labels import :

 - Add labels in config.json
 - Add mapping in src/elasticsearch/mappings/labels.mapping.json

## Known bugs

 - Memory leak on Debian 9 while downloading Discogs files.

You can download them manually and run the import command after :

```
cd downloads
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2020/discogs_20200901_artists.xml.gz
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2020/discogs_20200901_masters.xml.gz
wget https://discogs-data.s3-us-west-2.amazonaws.com/data/2020/discogs_20200901_releases.xml.gz
gunzip discogs_20200901_*
cd ..
npm run import -- --d 20200901 -f master
```
