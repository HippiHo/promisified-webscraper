require("dotenv").config({ path: __dirname + "/.env" });
const request = require("request");
const cheerio = require("cheerio");
const util = require("util");
const helper = require("./helper");
const Logger = require("./logger");
const cron = require("node-cron");
const promisifiedRequest = util.promisify(request);
const interval = process.env.CRONINTERNAL || "0 1,13 * * *";

const work = async () => {
  const list = [
    // {link: 'dingdong', selector: ".product-listing-h2 a"},
    {
      link: "https://www.tbd.community/en/jobs?r=206#search",
      selector: ".job.card .title"
    },
    {
      link: "http://berlinstartupjobs.com/engineering",
      selector: ".product-listing-h2 a"
    },
    {
      link:
        "https://www.stepstone.de/5/ergebnisliste.html?stf=freeText&ns=1&qs=%5B%7B%22id%22%3A%22419239%22%2C%22type%22%3A%22geocity%22%2C%22description%22%3A%22Berlin%22%7D%5D&companyID=0&cityID=0&sourceOfTheSearchField=resultlistpage%3Ageneral&searchOrigin=Resultlist_top-search&ke=&ws=Berlin&ra=10",
      selector: ".job-element__url-title-text"
    },
    {
      link:
        "https://www.glassdoor.de/Job/berlin-jobs-SRCH_IL.0,6_IC2622109.htm",
      selector: ".jobLink"
    },
    {
      link: "https://www.monster.de/jobs/suche/?where=Berlin",
      selector: ".title a"
    }
  ];
  const terms = [
    "software",
    "entwickler",
    "developer",
    "ui",
    "frontend",
    "backend"
  ];

  console.time("TimeConsumed");
  let promises = [];

  try {
    for (let site of list) {
      promises.push(promisifiedRequest(site.link));
    }
    console.log("promises", promises);
    const responses = await Promise.all(promises);
    let jobs = [];
    for (let i = 0; i < responses.length; i++) {
      const $ = cheerio.load(responses[i].body);
      console.log($(list[i].selector).length);
      if ($(list[i].selector).length > 0) {
        $(list[i].selector).each(function(i, elem) {
          for (let term of terms) {
            if (
              $(this)
                .text()
                // with regex:
                // .match(/javascript developer|ui|front|back|entwickler/i)
                .toLowerCase()
                // my solution without regex
                .includes(term)
              // tommies solution:
              //.indexOf(term.toLowerCase()) !== -1
            ) {
              jobs.push($(this).text());
            }
          }
        });
      } else {
        console.error(
          `Selector ${JSON.stringify(
            list[i].selector
          )} in site ${JSON.stringify(list[i].link)} doesn't return anything`
        );
      }
    }
    console.log("jobs", jobs);

    const mailResponse = await helper(jobs.join());
    console.timeEnd("TimeConsumed");
    Logger(`Successfully send with id: ${mailResponse.messageId}`);
  } catch (error) {
    throw new Error(error);
  }
};

cron.schedule(interval, () => {
  console.log("Cronjob is running: ", interval);
  work();
});
