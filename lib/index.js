var pool;
var database_name;
var port;
var host;

function setBDConnection(db) {
  if (!db) {
    console.error("database is not connect!");
    return false;
  }
  if (!db.config) {
    console.error("database is not connect!");
    return false;
  }
  if (!db.config.connectionConfig) {
    console.error("database is not connect!");
    return false;
  }
  if (!db.config.connectionConfig.database) {
    console.error("database is not connect!");
    return false;
  }
  if (!db.config.connectionConfig.host) {
    console.error("database is not connect!");
    return false;
  }
  if (!db.config.connectionConfig.port) {
    console.error("database is not connect!");
    return false;
  }
  pool = db;
  database_name = pool.config.connectionConfig.database;
  host = pool.config.connectionConfig.host;
  port = pool.config.connectionConfig.port;
  if (!pool || !database_name || !host || !port) {
    console.error("database is not connect!");
    return false;
  }
  return true;
}
const dbQuery = (sql) => {
  return new Promise((resolve, reject) => {
    if (sqlConnect(pool)) {
      return reject(sqlConnect(pool));
    }
    pool.query(sql, function (error, results, fields) {
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
      `SELECT ${selectOption(data.select)} FROM ${data.table} ${whereClause(
        data
      )} ${isLatest(data.latest)} ${isLimit(data.limit)} ${pagination(data)}`,
      async (err, res) => {
        if (err) {
          return reject(err);
        }
        if (!isCheck(data.pagination) || data.pagination >= 0) {
          pool.query(
            `SELECT count(*) as totalData FROM ${data.table} ${whereClause(
              data
            )} ${isLatest(data.latest)}`,
            async (err, resp) => {
              if (err) {
                return reject(err);
              }
              let paginate = paginationData(resp[0].totalData, data);
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, data.with);
                resw.push(item);
              }
              return resolve({ resw, paginate });
            }
          );
        } else {
          for (const iterator of res) {
            const item = await withdataForGet(reject, iterator, data.with);
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
      `SELECT ${selectOption(data.select)} FROM ${data.table} ${whereClause(
        data
      )}   ${isLatest(data.latest)} ${isLimit(data.limit, 1)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res.length > 0) {
          return withdata(reject, resolve, res[0], data.with);
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
      `SELECT ${selectOption(data.select)} FROM ${data.table} ${joinTable(
        data.join
      )} ${whereClause(data)} ${isLatest(data.latest)} ${isLimit(
        data.limit
      )} ${pagination(data)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (!isCheck(data.pagination) || data.pagination >= 0) {
          pool.query(
            `SELECT count(*) as totalData FROM ${data.table} ${joinTable(
              data.join
            )} ${whereClause(data)} ${isLatest(data.latest)}`,
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
      `SELECT ${selectOption(data.select)} FROM ${data.table} ${withTable(
        data.with
      )}  ${whereClause(data)} ${isLatest(data.latest)} ${isLimit(
        data.limit
      )} ${pagination(data)}`,
      (err, res) => {
        if (err) {
          return reject(err);
        }
        if (!isCheck(data.pagination) || data.pagination >= 0) {
          pool.query(
            `SELECT count(*) as totalData FROM ${data.table} ${withTable(
              data.with
            )} ${whereClause(data)} ${isLatest(data.latest)}`,
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
const getKeyValue = (data, setType = "WHERE") => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    setItem.push(`${key}='${value}'`);
  }
  return " " + setType + " " + setItem.toString();
};
const selectOption = (data) => {
  if (data != undefined && data != null && data != "" && data.length > 0)
    return data.toString();
  return "*";
};
const isTable = (data) => {
  if (data != undefined && data != null && data != "") return false;
  return "Table name is missing!";
};
const isLimit = (data, count = "") => {
  if (
    data != undefined &&
    data != null &&
    data != "" &&
    typeof data == "number" &&
    data > 0
  ) {
    if (count != "" && data < 2) return `LIMIT ${count}`;
    return `LIMIT ${data}`;
  }
  if (count != "") return `LIMIT ${count}`;
  return "";
};
const isLatest = (data) => {
  if (data != undefined && data != null && data != "")
    return `order by ${data} DESC`;
  return "";
};
const isCheck = (data) => {
  if (data != undefined && data != null && data != "") return false;
  return true;
};
const isKey = (data) => {
  if (data != undefined && (data == null || data == "")) return true;
  return false;
};

//where clause condition
const whereAnd = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key}='${value}'`);
    } else {
      setItem.push(`${key}='${value}'`);
    }
  }
  return `${setItem.toString()}`;
};
const whereOr = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` OR ${key}='${value}'`);
    } else {
      setItem.push(`${key}='${value}'`);
    }
  }
  return `${setItem.toString()}`;
};
const whereIs = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} IS ${value}`);
    } else {
      setItem.push(`${key} IS ${value}`);
    }
  }
  return `${setItem.toString()}`;
};
const whereIn = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} IN (${value.toString()})`);
    } else {
      setItem.push(`${key} IN (${value.toString()})`);
    }
  }
  return ` ${setItem.toString()}`;
};
const whereNotIn = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} NOT IN (${value.toString()})`);
    } else {
      setItem.push(`${key} NOT IN (${value.toString()})`);
    }
  }
  return `${setItem.toString()}`;
};
const whereRaw = (data) => {
  if (isCheck(data)) return "";
  return `${data}`;
};

const whereClause = (data, resData) => {
  let addCondition = "";
  const where_not_in = whereNotIn(data.whereNotIn).replace(/,/g, "");
  if (where_not_in != "") addCondition += where_not_in;
  const where_in = whereIn(data.whereIn);
  if (where_in != "" && where_not_in != "") {
    addCondition += ` AND ${where_in}`;
  } else if (where_in != "") {
    addCondition += where_in;
  }
  const where_and = whereAnd(data.where).replace(/,/g, "");
  if (where_and != "" && (where_in != "" || where_not_in != "")) {
    addCondition += ` AND ${where_and}`;
  } else if (where_and != "") {
    addCondition += where_and;
  }

  const where_or = whereOr(data.whereOr).replace(/,/g, "");
  if (
    where_or != "" &&
    (where_and != "" || where_in != "" || where_not_in != "")
  ) {
    addCondition += ` OR ${where_or}`;
  } else if (where_or != "") {
    addCondition += where_or;
  }

  const where_is = whereIs(data.whereIs).replace(/,/g, "");
  if (
    where_is != "" &&
    (where_or != "" || where_and != "" || where_in != "" || where_not_in != "")
  ) {
    addCondition += ` AND ${where_is}`;
  } else if (where_is != "") {
    addCondition += where_is;
  }

  const where_row = whereRaw(data.whereRaw);
  const connect_tb = connect(data.connect, resData);
  if (
    connect_tb != "" &&
    (where_is != "" ||
      where_or != "" ||
      where_and != "" ||
      where_in != "" ||
      where_not_in != "")
  ) {
    addCondition += ` AND ${connect_tb}`;
  } else if (connect_tb != "") {
    addCondition += connect_tb;
  }

  if (
    where_row != "" &&
    (connect_tb != "" ||
      where_is != "" ||
      where_or != "" ||
      where_and != "" ||
      where_in != "" ||
      where_not_in != "")
  ) {
    addCondition += ` AND ${where_row}`;
  } else if (where_row != "") {
    addCondition += where_row;
  }
  return addCondition != "" ? `WHERE ${addCondition.trim()}` : "";
};

// on clause condition
const onAnd = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key}=${value}`);
    } else {
      setItem.push(`${key}=${value}`);
    }
  }
  return `${setItem.toString()}`;
};
const onOr = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` OR ${key}='${value}'`);
    } else {
      setItem.push(`${key}=${value}`);
    }
  }
  return `${setItem.toString()}`;
};
const onIs = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} IS ${value}`);
    } else {
      setItem.push(`${key} IS ${value}`);
    }
  }
  return `${setItem.toString()}`;
};
const onIn = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} IN (${value.toString()})`);
    } else {
      setItem.push(`${key} IN (${value.toString()})`);
    }
  }
  return ` ${setItem.toString()}`;
};
const onNotIn = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${key} NOT IN (${value.toString()})`);
    } else {
      setItem.push(`${key} NOT IN (${value.toString()})`);
    }
  }
  return `${setItem.toString()}`;
};
const onRaw = (data) => {
  if (isCheck(data)) return "";
  return `${data}`;
};

const onClause = (data) => {
  let addCondition = "";
  const on_not_in = onNotIn(data.onNotIn).replace(/,/g, "");
  if (on_not_in != "") addCondition += on_not_in;
  const on_in = onIn(data.onIn);
  if (on_in != "" && on_not_in != "") {
    addCondition += ` AND ${on_in}`;
  } else if (on_in != "") {
    addCondition += on_in;
  }
  const on_and = onAnd(data.on).replace(/,/g, "");
  if (on_and != "" && (on_in != "" || on_not_in != "")) {
    addCondition += ` AND ${on_and}`;
  } else if (on_and != "") {
    addCondition += on_and;
  }

  const on_or = onOr(data.onOr).replace(/,/g, "");
  if (on_or != "" && (on_and != "" || on_in != "" || on_not_in != "")) {
    addCondition += ` OR ${on_or}`;
  } else if (on_or != "") {
    addCondition += on_or;
  }

  const on_is = onIs(data.onIs).replace(/,/g, "");
  if (
    on_is != "" &&
    (on_or != "" || on_and != "" || on_in != "" || on_not_in != "")
  ) {
    addCondition += ` AND ${on_is}`;
  } else if (on_is != "") {
    addCondition += on_is;
  }

  const on_row = onRaw(data.onRaw);
  if (
    on_row != "" &&
    (on_is != "" ||
      on_or != "" ||
      on_and != "" ||
      on_in != "" ||
      on_not_in != "")
  ) {
    addCondition += ` AND ${on_row}`;
  } else if (on_row != "") {
    addCondition += on_row;
  }
  return addCondition != "" ? `ON ${addCondition.trim()}` : "";
};
//end on
const pagination = (data) => {
  if (isCheck(data.pagination) || data.pagination == NaN) return "";
  if (
    isLimit(data.limit) == "" ||
    (isCheck(data.pagination) && isLimit(data.limit) == 0)
  )
    return "";
  return `OFFSET ${parseInt(data.pagination) * parseInt(data.limit)}`;
};

const paginationData = (totalData, data, page = 0) => {
  if (isCheck(totalData) && data.pagination < 0) return "";
  let pageCountExce =
    totalData > 0 && totalData > data.limit ? totalData / data.limit : 0;
  let pageCount =
    isInt(pageCountExce) == 0
      ? pageCountExce
      : pageCountExce - isInt(pageCountExce) + 1;
  let currentPage = data.pagination;
  let pagelenth = [];
  for (let index = 0; index < pageCount; index++) {
    pagelenth.push(index);
  }
  return { pageCount, currentPage, pagelenth, totalData };
};
const joinTable = (data) => {
  if (data !== undefined && isCheck(data) && data.length <= 0) return "";
  let str = " ";
  for (const join of data) {
    if (isTable(join.table)) return "";
    if (
      join.type != undefined &&
      join.type != null &&
      joinType(join.type) != ""
    ) {
      str += ` ${joinType(join.type)} ${join.table} ${onClause(join)}`;
    } else {
      str += ` JOIN ${join.table} ${onClause(join)}`;
    }
  }
  return str;
};
const withTable = (data) => {
  if (data !== undefined && isCheck(data) && data.length <= 0) return "";
  let str = " ";
  for (const key in data) {
    if (Object.hasOwnProperty.call(data, key)) {
      const element = data[key];
      for (const join of data[key]) {
        if (isTable(join.table)) return "";
        if (key != undefined && key != null && joinType(key) != "") {
          str += ` ${joinType(key)} ${join.table} ${onClause(join)}`;
        } else {
          str += ` JOIN ${join.table} ${onClause(join)}`;
        }
      }
    }
  }
  return str;
};
const withdata = (errThrow, result, resData, datas) => {
  if (datas !== undefined && isCheck(datas) && datas.length <= 0)
    return result(resData);
  let totalKeyCount = 0;
  for (const _ in datas) {
    totalKeyCount++;
  }
  let keyIndex = 0;
  for (const key in datas) {
    console.log(key);
    let data = datas[key];
    pool.query(
      `SELECT ${selectOption(data.select)} FROM ${data.table} ${whereClause(
        data,
        resData
      )} ${isLatest(data.latest)} ${isLimit(data.limit)} ${pagination(data)}`,
      (err, res) => {
        if (err) {
          return errThrow(err);
        }
        if (!isCheck(data.pagination) || data.pagination >= 0) {
          pool.query(
            `SELECT count(*) as totalData FROM ${data.table} ${whereClause(
              data,
              resData
            )} ${isLatest(data.latest)}`,
            (err, resp) => {
              if (err) {
                return errThrow(err);
              }
              let paginate = paginationData(resp[0].totalData, data);
              resData[key] = { res, paginate };
            }
          );
        } else {
          resData[key] = res;
        }
        keyIndex++;
        if (keyIndex === totalKeyCount) {
          return result(resData);
        }
      }
    );
  }

  if (keyIndex === totalKeyCount) {
    return result(resData);
  }
};
const withdataForGet = (errThrow, resData, datas) => {
  return new Promise((resolve, reject) => {
    if (datas !== undefined && isCheck(datas) && datas.length <= 0)
      return resolve(resData);
    let totalKeyCount = 0;
    for (const _ in datas) {
      totalKeyCount++;
    }
    let keyIndex = 0;
    for (const key in datas) {
      console.log(key);
      let data = datas[key];
      pool.query(
        `SELECT ${selectOption(data.select)} FROM ${data.table} ${whereClause(
          data,
          resData
        )} ${isLatest(data.latest)} ${isLimit(data.limit)} ${pagination(data)}`,
        (err, res) => {
          if (err) {
            return errThrow(err);
          }
          if (!isCheck(data.pagination) || data.pagination >= 0) {
            pool.query(
              `SELECT count(*) as totalData FROM ${data.table} ${whereClause(
                data,
                resData
              )} ${isLatest(data.latest)}`,
              (err, resp) => {
                if (err) {
                  return errThrow(err);
                }
                let paginate = paginationData(resp[0].totalData, data);
                resData[key] = { res, paginate };
              }
            );
          } else {
            resData[key] = res;
          }
          keyIndex++;
          if (keyIndex === totalKeyCount) {
            return resolve(resData);
          }
        }
      );
    }

    if (keyIndex === totalKeyCount) {
      return resolve(resData);
    }
  });
};
const connect = (tbcon, resdata) => {
  if (isCheck(tbcon)) return "";
  let str = "";
  for (const key in tbcon) {
    let baseColunm = isCheck(resdata[key]) ? resdata[tbcon[key]] : resdata[key];
    let colunm = isCheck(resdata[key]) ? key : tbcon[key];
    if (str === "") {
      str += `${colunm} = ${baseColunm} `;
    } else {
      str += `AND ${colunm} = ${baseColunm}`;
    }
  }
  console.log(str);
  return str;
};
const joinType = (data) => {
  let send = "";
  if (data == "belongsTo" || data == "INNER JOIN" || data == "inner join") {
    send = "INNER JOIN";
  }
  if (data == "hasOne" || data == "JOIN" || data == "join") {
    send = "JOIN";
  }
  if (data == "belongsToMany" || data == "LEFT JOIN" || data == "left join") {
    send = "LEFT JOIN";
  }
  if (data == "hasMany" || data == "RIGHT JOIN" || data == "right join") {
    send = "RIGHT JOIN";
  }
  return send;
};
const isInt = (data) => {
  return data % 1;
};
const sqlConnect = (pool) => {
  if (pool !== undefined && pool !== null && pool !== "") {
    pool.getConnection((err, connection) => {
      if (err) {
        console.log(err.message);
        return "Please Check You Database Connection!";
      }
    });
  } else {
    return "Please Check You Database Connection!";
  }
};
module.exports = {
  setBDConnection,
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
};
