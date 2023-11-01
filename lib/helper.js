const {
    isLatest,isLimit,isCheck,isTable
  } = require('./isCheck');
  const {
    sqlConnect,
    withdataForGet,
    withdata,
    withTable,joinTable,paginationData,pagination,whereClause,
    selectOption,getKeyValue,
  } = require('./mysqlBuilder');

  var pool;
  var database_name;
  var port;
  var host;
  
  function setDBConnection(db) {
    if (!db) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    if (!db.config) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    if (!db.config.connectionConfig) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    if (!db.config.connectionConfig.database) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    if (!db.config.connectionConfig.host) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    if (!db.config.connectionConfig.port) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
    pool = db;
    database_name = pool.config.connectionConfig.database;
    host = pool.config.connectionConfig.host;
    port = pool.config.connectionConfig.port;
    if (!pool || !database_name || !host || !port) {
      console.error("kp-mysql-models is not connect database.Please Check You Database Connection!");
      return false;
    }
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
  const get = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      if (isTable(data.table)) return reject(isTable(data.table));
      let resw = [];
      pool.query(
        `SELECT ${selectOption(data)} FROM ${data.table} ${whereClause(
          data
        )} ${isLatest(data)} ${isLimit(data)} ${pagination(data)}`,
        async (err, res) => {
          if (err) {
            return reject(err);
          }
          if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
            pool.query(
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
  const first = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      if (isTable(data.table)) return reject(isTable(data.table));
      pool.query(
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
  
  const dbJoin = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      pool.query(
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
            pool.query(
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
  
  const dbWith = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      pool.query(
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
            pool.query(
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
  
  const create = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      if (isTable(data.table)) return reject(isTable(data.table));
      if (data.elements != undefined && data.elements != null) {
        let keys = Object.keys(data.elements).toString();
        let values = Object.values(data.elements).toString();
        pool.query(
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
  const save = (data) => {
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
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
        pool.query(sqlQuery, (err, res) => {
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
  const update = (data) => {
    if (isTable(data.table)) return reject(isTable(data.table));
    return new Promise(async (resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      if (data.elements != undefined && data.elements != null) {
        var sqlQuery = `UPDATE ${data.table} ${getKeyValue(
          data.elements,
          "SET"
        )} ${whereClause(data)}`;
        pool.query(sqlQuery, (err, res) => {
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
  
  const destroy = (data) => {
    if (isTable(data.table)) return reject(isTable(data.table));
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      if (data.where != undefined) {
        pool.query(
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
  
  const deleleAll = (data) => {
    if (isTable(data.table)) return reject(isTable(data.table));
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      pool.query(`DELETE FROM ${data.table} ${whereClause(data)}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve(res);
      });
    });
  };
  const trunCate = (data) => {
    if (isTable(data.table)) return reject(isTable(data.table));
    return new Promise((resolve, reject) => {
      if (sqlConnect(pool)) {
        return reject(sqlConnect(pool));
      }
      pool.query(`TRUNCATE TABLE ${data.table}`, (err, res) => {
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