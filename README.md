# discogs-xml2elasticsearch

This project is a importer of Discogs XMLs : https://data.discogs.com/
to Elasticsearch

It has been developed with Elasticsearch 6.2

Feel free to fork & upgrade.

Usage :

npm run import -- -h

> discogs-xml2elasticsearch@0.1.0 import /Users/thomas/Development/discogs-xml2elasticsearch
> node boot.js "-h"

usage: boot.js [-h] [-v] [-d DATE] [-f {artists,masters,releases,labels}]

Discogs XMLs to Elasticsearch importer

Optional arguments:
  -h, --help            Show this help message and exit.
  -v, --version         Show program's version number and exit.
  -d DATE, --date DATE  Specify a Discogs date file. ex: 20170101
  -f {artists,masters,releases,labels}, --file {artists,masters,releases,labels}
                        Specify a Discogs type to import