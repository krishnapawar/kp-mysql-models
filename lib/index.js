
const { isCheck } = require('./isCheck');

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
  isCheck,
};
