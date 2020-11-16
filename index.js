/**
 * SFDC Webhook Sample
 */

require('dotenv').config();
const bcrypt = require('bcryptjs');
const jsforce = require('jsforce');

exports.sfdcWebhook = async (req, res) => {
  // check by clientSecret's hash
  const auth = bcrypt.compareSync(
    process.env.SPALO_CLIENT_SECRET,
    req.body.secretHash
  );

  if (auth !== true) {
    console.log('Client Secret Error');
    return res.status(401).send('Unauthorized').end();
  }

  // Check Body.
  console.log('REQUEST-BODY:', req.body);

  // data setting.
  const historyId = req.body.historyId;
  const senderName = req.body.senderName;
  const yourName = req.body.data['名前'];
  const age = req.body.data['年齢'];
  const mail = req.body.data['メールアドレス'];
  const date = req.body.data['日付'];
  const dm = date.match(/(\d+)年(\d+)月(\d+)日/);
  const date_fmt = dm[1] + '-' + dm[2] + '-' + dm[3];
  const time = req.body.data['時間'];
  const tm = time.match(/(\d+)時(\d+)分/);
  const time_fmt = tm[1] + ':' + tm[2];

  // endpoint
  const login_url = 'https://login.salesforce.com';

  // 接続application
  const consumer_key = process.env.CONSUMER_KEY;
  const consumer_secret = process.env.CONSUMER_SECRET;

  // system administrator
  const client_username = process.env.CLIENT_USERNAME;
  const client_password = process.env.PASSWORD + process.env.SECURITY_TOKEN;

  // custom object
  const sobject_name = 'MendanSheetSimple__c';

  // postdata
  const insert_data = {
    history_id__c: historyId,
    sendername__c: senderName,
    date__c: date_fmt,
    time__c: time_fmt,
    yourname__c: yourName,
    age__c: age,
    mail__c: mail,
  };

  // Create Connection.
  const conn = new jsforce.Connection({
    oauth2: {
      loginUrl: login_url,
      clientId: consumer_key,
      clientSecret: consumer_secret,
    },
  });

  // POST
  conn.login(client_username, client_password, function (error, response) {
    if (error) {
      console.log(error);
      return res.status(401).end();
    }
    // Insert
    conn.sobject(sobject_name).create(insert_data, function (error, response) {
      if (error) {
        console.log(error);
        return res.status(400).end();
      }
      console.log(response);
      return res.status(200).send(response).end();
    });
  });
};
