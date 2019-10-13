const csvParser = require('csv-parse');
const fs = require('fs');
const config = require('../../config/configLoader.js');

const POs = {
  EK: 'Einzelkür',
  PK: 'Paarkür',
  KG: 'Kleingruppe',
  GG: 'Großgruppe',
  ÜB: 'Übernachtung'
};
function beautifyData(data) {
  const result = {};
  for (const entry of data) {
    entry.id = parseInt((entry['DM-ID'].match(/\d+/) || [])[0]);
    if (entry.id) {
      result[entry.id] = [];
      for (const item in POs) {
        if (parseInt(entry['PO_' + item])) {
          result[entry.id].push({
            name: POs[item],
            ordered: parseInt(entry['PO_' + item]),
            payed: parseInt(entry['ZE_' + item])
          });
        }
      }
    }
  }
  return result;
}

function update(file) {
  return new Promise((resolve, reject) => {
    const parser = csvParser({ delimiter: ';', columns: true }, (err, data) => {
      if(err){
        return reject(err);
      }
      module.exports.data = beautifyData(data);
      resolve(data);
    });

    fs.createReadStream(file).pipe(parser);
  });
}

async function keepUpToDate(file) {
  await update(file);
  fs.watch(file, (eventType, filename) => {
    if(eventType === 'change'){
      update(file)
    }
  });
}
keepUpToDate(config.payments.paymentDataLocation);
module.exports = {data:undefined};
