const fs = require("fs");
const util = require("util");

function Logger(message) {
  const stream = fs.createWriteStream("cron.log", {
    flags: "a" // 'a' means appending (old data will be preserved)
  });
  stream.write(util.format(`JobCron ${new Date().toISOString()} ${message}\n`));
}

module.exports = Logger;
