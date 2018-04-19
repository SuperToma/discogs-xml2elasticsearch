import fs from 'fs';
import https from 'https';
import ProgressBar from 'progress';

import config from '../config/config.json';

class Downloader {
  /**
   * @param date
   * @param files
   */
  constructor (date, files) {
    this.date = date;
    this.files = files;

    return this;
  }

  /**
   * @param date
   * @param files
   * @returns {Promise.<void>}
   */
  async getDiscogsFiles () {
    for (const file of this.files) {
      if (!fs.existsSync(`./downloads/discogs_${this.date}_${file}s.xml`)) {
        await this.downloadFile(this.date, file);
      } else {
        console.log(`File ./downloads/discogs_${this.date}_${file}s.xml already downloaded`);
      }
    }
  }

  /**
   *
   * @param fileId
   * @param fileType
   * @returns {Promise}
   */
  downloadFile (fileId, fileType) {
    return new Promise(() => {
      const year = fileId.substring(0, 4);
      const file = fs.createWriteStream(`./downloads/discogs_${fileId}_${fileType}s.xml.gz`);

      // https://stackoverflow.com/questions/41470296/how-to-await-and-return-the-result-of-a-http-request-so-that-multiple-request
      const req = https.request({
        host: 'discogs-data.s3-us-west-2.amazonaws.com',
        port: 443,
        path: `${config.discogs.prefix_file_url}${year}/discogs_${fileId}_${fileType}s.xml.gz`,
      });

      console.log(`Start Downloading : ${req.path}`);

      req.on('response', res => {
        const len = parseInt(res.headers['content-length'], 10);

        const bar = new ProgressBar('[:bar] :downloadSpeed/s :percent :etas', {
          complete: '=',
          incomplete: ' ',
          width: 20,
          renderThrottle: 1000,
          total: len,
        });

        res.on('data', chunk => {
          const elapsed = new(Date) - bar.start;

          bar.tick(chunk.length, {
            downloadSpeed: this.bytesToHumanSize(bar.curr / (elapsed / 1000)),
          });

          res.pipe(file);
        });

        res.on('end', () => {
          console.log('\n');
        });
      });

      req.end();
    });
  }

  /**
   *
   * @param bytes
   * @returns {*}
   */
  bytesToHumanSize (bytes) {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) {
      return 'n/a';
    }
    const i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)), 10);
    if (i === 0) {
      return `${bytes} ${sizes[i]})`;
    }

    return `${(bytes / (1024 ** i)).toFixed(1)} ${sizes[i]}`;
  }
}

export default Downloader;
