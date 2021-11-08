const fs = require("fs");
const { createClient } = require("redis");
const config = require("../config/config.js");

const _path = process.cwd().trim("\\lib");

async function init() {
  //初始化reids
  const client = createClient({
    url: `redis://:${config.redis.password}@${config.redis.host}:${config.redis.port}`,
  });

  client.on("error", function (err) {
    logger.error(`redis错误:${err}`);
    process.exit();
  });

  await client.connect();
  client.select(config.redis.db);
  global.redis = client;

  //初始化app
  let readDir = fs.readdirSync(_path + "/lib/app");
  let apps = {};
  for (let val of readDir) {
    apps[val.replace(".js", "")] = require(`./app/${val}`);
  }
  global.apps = apps;

  //初始化配置
  let groupConfig = {};
  groupConfig.default = config.group.default;
  for (let i in config.group) {
    if (i == "default") {
      continue;
    }
    groupConfig[i] = Object.assign({}, config.group.default, config.group[i]);
  }
  global.groupConfig = groupConfig;

  //创建文件夹
  if (!fs.existsSync("./data/html/")) {
    fs.mkdirSync("./data/html/");

    let dir = {
      genshin: ["abyss", "character", "gacha", "life", "role", "weapon"],
    };
    for (let i in dir) {
      fs.mkdirSync(`./data/html/${i}/`);
      for (let val of dir[i]) {
        fs.mkdirSync(`./data/html/${i}/${val}/`);
      }
    }
  }
}

module.exports = { init };