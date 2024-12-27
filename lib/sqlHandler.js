const {
  isLatest,isLimit,isCheck,isTable,isOne,isInt,isNotObject,
  isArray,
  isObject
} = require('./supporterMethodes');

const getKeyValue = (data, setType = "WHERE") => {
  if (isCheck(data)) return "";
  let setItem = [];
  for (const [key, value] of Object.entries(data)) {
    setItem.push(`${key}='${value}'`);
  }
  return " " + setType + " " + setItem.toString();
};
const selectOption = (data, x) => {
  if (data?.select || x?._show) {
    return data?.select?.toString() ?? x._show.toString();
  }
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

  const clauses = [
    whereNotIn(data.whereNotIn).replace(/,/g, ""),
    whereIn(data.whereIn),
    whereAnd(data.where).replace(/,/g, ""),
    whereOr(data.whereOr).replace(/,/g, ""),
    whereIs(data.whereIs).replace(/,/g, ""),
    connect(data, resData),
    whereRaw(data.whereRaw),
    onlyTrashed(data.onlyTrashed),
    whereIsNull(data.whereIsNull || data.whereNull),
    whereIsNotNull(data.whereIsNotNull || data.whereNotNull)
  ];

  const validClauses = clauses.filter(clause => clause !== "");

  if (validClauses.length === 0) return "";

  return `WHERE ${validClauses.join(" AND ").replace(/( AND )? OR /g, " OR ")}`;
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
  const clauses = [
    onNotIn(data.onNotIn).replace(/,/g, ""),
    onIn(data.onIn),
    onAnd(data.on).replace(/,/g, ""),
    onOr(data.onOr).replace(/,/g, ""),
    onIs(data.onIs).replace(/,/g, ""),
    onRaw(data.onRaw)
  ];

  const validClauses = clauses.filter(clause => clause !== "");

  if (validClauses.length === 0) return "";

  return `ON ${validClauses.join(" AND ").replace(/( AND )? OR /g, " OR ")}`;
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
  const joinMap = {
      belongsto: 'INNER JOIN',
      'inner join': 'INNER JOIN',
      innerjoin: 'INNER JOIN',
      hasone: 'JOIN',
      join: 'JOIN',
      belongstomany: 'LEFT JOIN',
      'left join': 'LEFT JOIN',
      leftjoin: 'LEFT JOIN',
      hasmany: 'RIGHT JOIN',
      'right join': 'RIGHT JOIN',
      rightjoin: 'RIGHT JOIN',
  };

  return joinMap[data.toLowerCase()] || '';
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
          connection.query(
            `SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${table}' ORDER BY ORDINAL_POSITION DESC LIMIT 1`,
            (err1, colunm) => {
              if (err1) return reject(err1);
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
            }
          );
          
        } catch (error) {
          return reject(error);
        }
      }
    );
  });
};
const sqlConnect = (pool) => {
  try {
    if (isCheck(pool) || isNotObject(pool)) {
      return "Error: Invalid or missing database connection. Please verify your database configuration.";
    }
  } catch (error) {
    return "Error: Unable to establish a database connection. Please check your database settings.";
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