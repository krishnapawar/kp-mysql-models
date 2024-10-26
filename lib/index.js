
const { isEmpty } = require('./supporterMethodes');

const {
  setDBConnection,
  get,
  first,
  dbQuery,
  trunCate,
  deleleAll,
  destroy,
  create,
  update,
  save,
  dbJoin,
  dbWith,
  collect
} = require('./helper');

const BaseModels = require('./BaseModels');

module.exports = {
  BaseModels,
  setDBConnection,
  get,
  first,
  dbQuery,
  trunCate,
  deleleAll,
  destroy,
  create,
  update,
  save,
  dbJoin,
  dbWith,
  isEmpty,
  collect
};
