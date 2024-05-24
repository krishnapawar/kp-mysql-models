const {
  isLatest,isLimit,isCheck,isTable,isOne,isInt,isNotObject,
  isArray,
  isObject
} = require('./isMethodes');

const getKeyValue = (data, setType = "WHERE") => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    setItem.push(`${key}='${value}'`);
  }
  return " " + setType + " " + setItem.toString();
};
const selectOption = (data,x) => {
  if ((data != undefined && data.select != undefined && Array.isArray(data.select) && data.select.length > 0) || (x!= undefined && Array.isArray(x._show) && x._show.length > 0))
    return Array.isArray(data.select) ? data.select.toString(): x._show.toString();
  return "*";
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
const whereIsNull = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${value} IS NULL`);
    } else {
      setItem.push(`${value} IS NULL`);
    }
  }
  return `${setItem.toString()}`;
};
const whereIsNotNull = (data) => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    if (setItem.length > 0) {
      setItem.push(` AND ${value} IS NOT NULL`);
    } else {
      setItem.push(`${value} IS NOT NULL`);
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
const  onlyTrashed= (data) => {
  if (isCheck(data)) return "";
  if (data === true ) return " deleted_at IS NOT NULL ";
  return "";
};
const whereClause = (data, resData) => {
  if (isCheck(data)) return ""; 
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
  
  const connect_tb = connect(data, resData);
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

  const where_row = whereRaw(data.whereRaw);
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

  const only_trashed = onlyTrashed(data.onlyTrashed);
  if (
    only_trashed != "" &&
    (where_row != "" || connect_tb != "" ||
      where_is != "" ||
      where_or != "" ||
      where_and != "" ||
      where_in != "" ||
      where_not_in != "")
  ) {
    addCondition += ` AND ${only_trashed}`;
  } else if (only_trashed != "") {
    addCondition += only_trashed;
  }

  const where_is_null = whereIsNull(data.whereIsNull);
  if (where_is_null != "" &&
    (only_trashed != "" || where_row != "" || connect_tb != "" ||
      where_is != "" ||
      where_or != "" ||
      where_and != "" ||
      where_in != "" ||
      where_not_in != "")
  ) {
    addCondition += ` AND ${where_is_null}`;
  } else if (where_is_null != "") {
    addCondition += where_is_null;
  }

  const where_is_not_null = whereIsNotNull(data.whereIsNotNull);
  if (where_is_not_null != "" &&
  (where_is_null != "" || only_trashed != "" || where_row != "" || connect_tb != "" ||
    where_is != "" ||
    where_or != "" ||
    where_and != "" ||
    where_in != "" ||
    where_not_in != "")
  ) {
    addCondition += ` AND ${where_is_not_null}`;
  } else if (where_is_not_null != "") {
    addCondition += where_is_not_null;
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
  if (isCheck(data)) return "";
  if (isCheck(data.pagination) || data.pagination == NaN) return "";
  if (
    isLimit(data) == "" ||
    (isCheck(data.pagination) && isLimit(data) == 0)
  )
    return "";
  return `OFFSET ${parseInt(data.pagination>=1 ? data.pagination-1:data.pagination) * parseInt(data.limit)}`;
};

const paginationData = (totalData, data, page = 0) => {
  if (isCheck(totalData) && data.pagination < 0) return "";
  let pageCountExce =
    totalData > 0 ? totalData / data.limit : 0;
  let totalPage =
    isInt(pageCountExce) == 0
      ? pageCountExce
      : pageCountExce - isInt(pageCountExce) + 1;
  let currentPage = data.pagination>0?data.pagination:1;
  let pagelenth = [];
  for (let index = 1; index <= totalPage; index++) {
    pagelenth.push(index);
  }
  let pageDataLimit=data.limit;
  return {pageDataLimit, totalPage, totalData, currentPage, pagelenth };
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
const withdata = (errThrow, resData, datas,dbcon=null) => {
  return new Promise((r,e)=>{
    try {
      let db = dbcon ?? pool;
      if(isCheck(datas)) return r(resData);
      if (datas.with !== undefined && isCheck(datas.with) && datas.with.length <= 0)
        return r(resData);
      let totalKeyCount = 0;
      for (const _ in datas.with) {
        totalKeyCount++;
      }
      let keyIndex = 0;
      for (const key in datas.with) {
        let data = datas.with[key];
        db.query(
          `SELECT ${selectOption(data)} FROM ${data.table} ${whereClause(
            data,
            resData
          )} ${isLatest(data)} ${isLimit(data)} ${pagination(data)}`,
          async(err, res) => {
            if (err) {
              return errThrow(err);
            }
            if (data!= undefined && !isOne(data) && (!isCheck(data.pagination) || data.pagination >= 0)) {
              db.query(
                `SELECT count(*) as totalData FROM ${data.table} ${whereClause(
                  data,
                  resData
                )} ${isLatest(data)}`,
                async(err, resp) => {
                  if (err) {
                    return errThrow(err);
                  }
                  let paginate = paginationData(resp[0].totalData, data);
                  resData[key] = { res, paginate };
                }
              );
            } else if(isOne(data)) {
              if (isCheck(data.with)) {
                resData[key] = res.length>0 ? res[0]:{};
              } else {
                console.log("ok");
                resData[key] = res.length>0 ? await withdata(e, res[0], data,db):{};
              }
            }else{
              if (isCheck(data.with)) {
                resData[key] = res;
              } else {
                resData[key] = await withdata(e, res, data,db);
              }
            }
            keyIndex++;
            if (keyIndex === totalKeyCount) {
              return r(resData);
            }
          }
        );
      }
    
      if (keyIndex === totalKeyCount) {
        return r(resData);
      }
    } catch (error) {
      return e(error);
    }
  });
};
const withdataForGet = async (errThrow, resData, datas, dbcon = null) => {
  let db = dbcon ?? pool;

  const executeQuery = (query) => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, res) => {
        if (err) return reject(err);
        resolve(res);
      });
    });
  };

  const getTotalDataCount = async (data, resData) => {
    const [resp] = await executeQuery(`SELECT count(*) as totalData FROM ${data.table} ${whereClause(data, resData)} ${isLatest(data)}`);
    return resp.totalData;
  };

  const processKey = async (key, data) => {
    const res = await executeQuery(`SELECT ${selectOption(data)} FROM ${data.table} 
    ${whereClause(data, resData)} ${isLatest(data)} ${isLimit(data, isOne(data))} ${pagination(data)}`);

    if (!isOne(data) && (!isCheck(data.pagination) || data.pagination >= 0)) {
      const totalData = await getTotalDataCount(data, resData);
      const paginate = paginationData(totalData, data);
      resData[key] = { res, paginate };
    } else if (isOne(data)) {
      if (isCheck(data.with)) {
        return resData[key] = res.length > 0 ? res[0] : {};
      } else {
       return resData[key] = res.length > 0 ? await withdataForGet(errThrow, res[0], data, db) : {};
      }
    } else {
      if (isCheck(data.with)) {
        return resData[key] = res;
      } else {
        return resData[key] = await Promise.all(res.map(async (r) => await withdataForGet(errThrow, r, data, db)));
      }
    }
  };
  return new Promise(async (resolve, reject) => {
    try {
      if (isCheck(datas)) return resolve(resData);
      if (datas.with !== undefined && isCheck(datas.with) && datas.with.length <= 0) return resolve(resData);

      const keys = Object.keys(datas.with);
      
      for (const key of keys) {
        await processKey(key, datas.with[key]);
      }
      return resolve(resData);
    } catch (error) {
      return errThrow(error);
    }
  });
};

const connect = (conn, resdata) => {
  if (isCheck(conn.connect) && isCheck(conn.hasOne) && isCheck(conn.belongsTo) && isCheck(conn.belongsToMany) && isCheck(conn.hasMany)) return "";
  let str = "";
  let tbcon = (conn.connect || conn.hasOne || conn.belongsTo || conn.hasMany || conn.belongsToMany);
  for (const key in tbcon) {
    let baseColumn = conn.connect 
    ? (isCheck(resdata[key]) ? resdata[tbcon[key]] : resdata[key]) 
    : resdata[tbcon[key]];

    let column = conn.connect 
    ? (isCheck(resdata[key])) ? key : tbcon[key] : key;

    const condition = isArray(tbcon) && !isObject(tbcon) ? `id = "${resdata[tbcon[key]]}" ` : `${column} = "${baseColumn}" `;
    str += str === "" ? condition : `AND ${condition}`;

  }
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
const addDeletedAt = (table, connection) => {
  if (isTable(table)) return reject(isTable(table));
  return new Promise((resolve, reject) => {
    if (sqlConnect(connection)) {
      return reject(sqlConnect(connection));
    }
    connection.query(
      `SHOW COLUMNS FROM ${table} LIKE "deleted_at"`,
      async (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res.length > 0) return resolve(true);
        try {
          const colunm = await dbQuery(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION DESC LIMIT 1`,
            connection
          );
          if (colunm.length) {
            connection.query(
              `ALTER TABLE ${table} ADD deleted_at TIMESTAMP NULL DEFAULT NULL AFTER ${colunm[0].COLUMN_NAME}`,
              (err, res) => {
                if (err) {
                  return reject(err);
                }
                return resolve(true);
              }
            );
          } else {
            return resolve(false);
          }
        } catch (error) {
          return reject(error);
        }
      }
    );
  });
};
const sqlConnect = (pool) => {
  try {
    if(isCheck(pool) || isNotObject(pool)){
      return "Hey! Please Check You Database Connection!";
    }
  } catch (error) {
    return "Hey! Please Check You Database Connection!";
  }
};
module.exports={
  addDeletedAt,
  sqlConnect,
  joinType,
  connect,
  withdataForGet,
  withdata,
  withTable,joinTable,paginationData,pagination,onClause,onRaw,onNotIn,
  onIn,onIs,onOr,onAnd,whereClause,onlyTrashed,whereRaw,whereNotIn,whereIn,whereIs,whereOr,whereAnd,
  selectOption,getKeyValue,
}