import fs from 'fs';
import util from 'util';
import XmlTagStream from 'xml-tag-stream';
import through2 from 'through2';
import xmlParser from 'xml2js';
import ProgressBar from 'progress';
import _ from 'underscore';
import config from '../config/config.json';
import EsClient from './elasticsearch';

class XmlParser {
  /**
   * @param date
   * @param files
   */
  constructor (date, files) {
    this.date = date;
    this.files = files;
    this.currentFile = null;

    return this;
  }

  /**
   * @returns {Promise.<void>}
   */
  async importData () {
    for (const file of this.files) {
      await this.importFile(this.date, file);
    }
  }

  async getNbTagsInFile (filePath, xmlTag) {
    let nbTag = 0;

    console.log(`Counting number of <${xmlTag}s> in file...`);

    const stream = fs.createReadStream(filePath)
      .pipe(new XmlTagStream(xmlTag))
      .on('data', () => { nbTag += 1; });

    const promise = new Promise((resolve, reject) => {
      stream.on('end', () => { console.log(`${nbTag} found`); resolve(nbTag); });
      stream.on('error', reject);
    });

    return promise;
  }

  getBarRemainTime (bar) {
    let ratio = bar.curr / bar.total;
    ratio = Math.min(Math.max(ratio, 0), 1);

    const percent = ratio * 100;
    const elapsed = new Date() - bar.start;

    const seconds = (percent === 100) ? 0 : Math.ceil(elapsed * (bar.total / bar.curr - 1) / 1000);

    const h = Math.floor(seconds / 3600);
    const m = Math.floor(seconds % 3600 / 60);
    const s = Math.floor(seconds % 3600 % 60);

    return `${h}h${m}m${s}s`;
  }

  /**
   * @param date
   * @param file
   * @returns {Promise.<void>}
   */
  async importFile (date, tag) {
    console.log('Starting Import');

    const filePath = `${__dirname}/../downloads/discogs_${this.date}_${tag}s.xml`;
    const totalObjects = await this.getNbTagsInFile(filePath, tag);
    //const totalObjects = 10000000;

    let bulk = [];

    const bar = new ProgressBar(':current/:total :rate/s [:bar] :percent :remain', {
      complete: '=',
      incomplete: ' ',
      width: 20,
      renderThrottle: 1000,
      total: totalObjects,
    });

    const stream = fs.createReadStream(filePath)
      .pipe(new XmlTagStream(tag))
      .pipe(through2.obj((tag, enc, cb) => xmlParser.parseString(tag, cb)));

    stream.on('data', data => {
      bar.tick({
        remain: this.getBarRemainTime(bar),
      });
      // console.log(util.inspect(data, false, null));
      // process.exit(0);
      const bulkAction = {
        index: {
          _index: tag,
          _type: tag,
          _id: eval(`data.${tag}.${config.objects[tag].id}`),
        },

      };

      const object = {};

      // Store XML object into an ES object
      for (const property in config.objects[tag]) {
        if (data[tag].hasOwnProperty(property)) {
          let values = null;
          try {
            values = eval(`data.${tag}.${config.objects[tag][property]}`);
          } catch (error) {
            //console.error(error);
          }

          // Transform XML attributes ($) as properties
          if (Array.isArray(values) && typeof values[0].$ === 'object') {
            values = values.map(infos => infos.$);
          }

          // Remove empty images uri
          if (Array.isArray(values) && property === 'images') {
            values = values.filter(value => value.uri.length > 0);
          }

          // Remove empty tracks
          if (Array.isArray(values) && property === 'tracklist') {
            values = values.filter(value => value.title[0].length > 0);
          }

          if (values && values.length > 0) { // Remove when checking if value is missing
            object[property] = values;
          }
        }
      }

      // Check if we missed a value in XML object
      /* for (const property in data[tag]) {
        if (property !== '$' && object.hasOwnProperty(property) === false) {
          console.log(`Property ${property} is missing : `);
          console.log(util.inspect(data[tag][property], false, null));
          console.log("\n\n");
        }
      } */

      // Filters
      //let allowInsert = true;

      /* 100/s slower
      const authorizedGenres = ["Brass & Military", "Electronic", "Pop", "Rock"];
      if (typeof object.genres !== "undefined") {
        if (_.intersection(object.genres, authorizedGenres).length > 0) {
          allowInsert = true;
        }
      }
      */

      /*const authorizedStyles = [
        "Dark Ambient", "Darkwave", "EBM", "Electro", "Goth Rock",
        //"Experimental", "Witch House",
        "Gothic Metal", "Industrial", "New Wave", "Synthwave", "Synth-pop",
      ];

      if (tag === 'release' && typeof object.styles !== "undefined") {
        if (_.intersection(object.styles, authorizedStyles).length === 0) {
          //console.log(_.intersection(object.styles, authorizedStyles));
          allowInsert = false;
        }
      }*/

      //if (allowInsert) {
        bulk.push(bulkAction, object);
      //}

      // DEBUG TRANSFORMATION

      /*
      console.log('\n\n\n>>>');
      console.log(util.inspect(data.release, false, null));
      console.log('<<<');
      console.log(util.inspect(object, false, null));
      process.exit(0);
*/

      if (bulk.length > 1000) {
        EsClient.sendBulk(bulk);
        bulk = [];
      }
    });

    EsClient.sendBulk(bulk); // Send last bulk

    stream.on('end', console.log.bind(console, `Import of ${tag}s ended !`));
  }
}

export default XmlParser;
