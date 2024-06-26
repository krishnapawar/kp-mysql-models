const {
  isLatest,isLimit,isCheck,isTable
} = require('./isMethodes');
const {
  sqlConnect,
  withdataForGet,
  withdata,
  withTable,joinTable,paginationData,pagination,whereClause,
  selectOption,getKeyValue,
} = require('./sqlHandler');

var pool;

function setDBConnection(db) {
  if (!db || isCheck(db) || isNotObject(db)) {
    console.error("Hey! Please Check You Database Connection!");
    return false;
  }
  pool = db;
  return true;
}
const dbQuery = (sql,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    db.query(sql, function (error, results, fields) {
      if (error) return reject(error);
      return resolve(results);
    });
  });
};
const get = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (isTable(data.table)) return reject(isTable(data.table));
    let resw = [];
    db.query(
      `SELECT ${selectOption(data)} FROM ${data.table} ${whereClause(
        data
      )} ${isLatest(data)} ${isLimit(data)} ${pagination(data)}`,
      async (err, res) => {
        if (err) {
          return reject(err);
        }
        if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
          db.query(
            `SELECT count(*) as totalData FROM ${data.table} ${whereClause(
              data
            )} ${isLatest(data)}`,
            async (err, resp) => {
              if (err) {
                return reject(err);
              }
              let paginate = paginationData(resp[0].totalData, data);
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, data);
                resw.push(item);
              }
              return resolve({ resw, paginate });
            }
          );
        } else {
          for (const iterator of res) {
            const item = await withdataForGet(reject, iterator, data);
            resw.push(item);
          }
          return resolve(resw);
        }
      }
    );
  });
};
//get singal data
const first = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (isTable(data.table)) return reject(isTable(data.table));
    db.query(
      `SELECT ${selectOption(data)} FROM ${data.table} ${whereClause(
        data
      )}   ${isLatest(data)} ${isLimit(data, 1)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res.length > 0) {
          return withdata(reject, resolve, res[0], data);
        }
        return resolve({});
      }
    );
  });
};

const dbJoin = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    db.query(
      `SELECT ${selectOption(data)} FROM ${data.table} ${joinTable(
        data.join
      )} ${whereClause(data)} ${isLatest(data)} ${isLimit(
        data
      )} ${pagination(data)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
          db.query(
            `SELECT count(*) as totalData FROM ${data.table} ${joinTable(
              data.join
            )} ${whereClause(data)} ${isLatest(data)}`,
            (err, resp) => {
              if (err) {
                return reject(err);
              }
              let paginate = paginationData(resp[0].totalData, data);

              return resolve({ res, paginate });
            }
          );
        } else {
          return resolve(res);
        }
      }
    );
  });
};

const dbWith = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    db.query(
      `SELECT ${selectOption(data)} FROM ${data.table} ${withTable(
        data.with
      )}  ${whereClause(data)} ${isLatest(data)} ${isLimit(
        data
      )} ${pagination(data)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
          db.query(
            `SELECT count(*) as totalData FROM ${data.table} ${withTable(
              data.with
            )} ${whereClause(data)} ${isLatest(data)}`,
            (err, resp) => {
              if (err) {
                return reject(err);
              }
              let paginate = paginationData(resp[0].totalData, data);

              return resolve({ res, paginate });
            }
          );
        } else {
          return resolve(res);
        }
      }
    );
  });
};

const create = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (isTable(data.table)) return reject(isTable(data.table));
    if (data.elements != undefined && data.elements != null) {
      let keys = Object.keys(data.elements).toString();
      let values = Object.values(data.elements).toString();
      db.query(
        `INSERT INTO ${data.table} (${keys}) VALUES (${values})`,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        }
      );
    } else {
      return resolve(true);
    }
  });
};
const save = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (isTable(data.table)) return reject(isTable(data.table));
    if (data.elements != undefined && data.elements != null) {
      if (
        whereClause(data) != undefined &&
        whereClause(data) != null &&
        whereClause(data) != ""
      ) {
        var sqlQuery = `UPDATE ${data.table} ${getKeyValue(
          data.elements,
          "SET"
        )} ${whereClause(data)}`;
      } else {
        var sqlQuery = `INSERT INTO ${data.table} ${getKeyValue(
          data.elements,
          "SET"
        )}`;
      }
      db.query(sqlQuery, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    } else {
      return resolve(true);
    }
  });
};
const update = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  if (isTable(data.table)) return reject(isTable(data.table));
  return new Promise(async (resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (data.elements != undefined && data.elements != null) {
      var sqlQuery = `UPDATE ${data.table} ${getKeyValue(
        data.elements,
        "SET"
      )} ${whereClause(data)}`;
      db.query(sqlQuery, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    } else {
      return resolve(true);
    }
  });
};

const destroy = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  if (isTable(data.table)) return reject(isTable(data.table));
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    if (data.where != undefined) {
      db.query(
        `DELETE FROM ${data.table} ${whereClause(data)}`,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        }
      );
    }
  });
};

const deleleAll = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  if (isTable(data.table)) return reject(isTable(data.table));
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    db.query(`DELETE FROM ${data.table} ${whereClause(data)}`, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};
const trunCate = (data,dbcon=null) => {
  let db = dbcon ?? pool; 
  if (isTable(data.table)) return reject(isTable(data.table));
  return new Promise((resolve, reject) => {
    if (sqlConnect(db)) {
      return reject(sqlConnect(db));
    }
    db.query(`TRUNCATE TABLE ${data.table}`, (err, res) => {
      if (err) {
        return reject(err);
      }
      return resolve(res);
    });
  });
};
module.exports={
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
}