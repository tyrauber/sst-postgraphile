const fs = require('fs'),
    path = require('path');

exports.up = async (knex) => {
  let sql = fs.readFileSync(path.join(__dirname, '../schema.sql')).toString();
  await knex.raw(sql)
};

exports.down = async (knex) => {
  await knex.raw(``);
};
