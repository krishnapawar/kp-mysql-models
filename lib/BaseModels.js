
const {
    isLatest,isLimit,isCheck,isTable
  } = require('./isCheck');
  const {
    addDeletedAt,
    sqlConnect,
    withdataForGet,
    withdata,
    withTable,joinTable,paginationData,pagination,whereClause,
    selectOption,getKeyValue,
  } = require('./mysqlBuilder');

  class BaseModels {
    constructor(db=""){
      this._table=false;
      this._softDelete=false;
      this._connection=db;
    }
    //start
    get(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        let response = [];
        this._connection.query(
          `SELECT ${selectOption(data)} FROM ${this.thisTable()} ${whereClause(
            data
          )} ${isLatest(data)} ${isLimit(data)} ${pagination(data)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${whereClause(
                  data
                )} ${isLatest(data)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, data);
                  for (const iterator of res) {
                    const item = await withdataForGet(reject, iterator, data,this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, data,this._connection);
                response.push(item);
              }
              return resolve(response);
            }
          }
        );
      });
    };
    //start
    first(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT ${selectOption(data)} FROM ${this.thisTable()} ${whereClause(
            data
          )}   ${isLatest(data)} ${isLimit(data, 1)}`,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return withdata(reject, resolve, res[0], data,this._connection);
            }
            return resolve({});
          }
        );
      });
    };
    //start
    dbQuery(sql){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(sql, function (error, results, fields) {
          if (error) return reject(error);
          return resolve(results);
        });
      });
    };
    dbJoin(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(
          `SELECT ${selectOption(data)} FROM ${this.thisTable()} ${joinTable(
            data.join
          )} ${whereClause(data)} ${isLatest(data)} ${isLimit(
            data
          )} ${pagination(data)}`,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${joinTable(
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
    dbWith(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(
          `SELECT ${selectOption(data)} FROM ${this.thisTable()} ${withTable(
            data.with
          )}  ${whereClause(data)} ${isLatest(data)} ${isLimit(
            data
          )} ${pagination(data)}`,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            if (data!= undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${withTable(
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
    
    create(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (data.elements != undefined && data.elements != null) {
          let keys = Object.keys(data.elements).toString();
          let values = Object.values(data.elements).toString();
          this._connection.query(
            `INSERT INTO ${this.thisTable()} (${keys}) VALUES (${values})`,
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
    save(data){
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (data.elements != undefined && data.elements != null) {
          if (
            whereClause(data) != undefined &&
            whereClause(data) != null &&
            whereClause(data) != ""
          ) {
            var sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(
              data.elements,
              "SET"
            )} ${whereClause(data)}`;
          } else {
            var sqlQuery = `INSERT INTO ${this.thisTable()} ${getKeyValue(
              data.elements,
              "SET"
            )}`;
          }
          this._connection.query(sqlQuery, (err, res) => {
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
    update(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise(async (resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (data.elements != undefined && data.elements != null) {
          var sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(
            data.elements,
            "SET"
          )} ${whereClause(data)}`;
          this._connection.query(sqlQuery, (err, res) => {
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
    
    destroy(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (data.where != undefined) {
          this._connection.query(
            `DELETE FROM ${this.thisTable()} ${whereClause(data)}`,
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
    delete(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (data.where != undefined) {
          this._connection.query(
            `DELETE FROM ${this.thisTable()} ${whereClause(data)}`,
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
    deleleAll(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(`DELETE FROM ${this.thisTable()} ${whereClause(data)}`, (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
      });
    };
    trunCate(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise((resolve, reject) => {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(`TRUNCATE TABLE ${this.thisTable()}`, (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
      });
    };
    trashed(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise( async(resolve,reject)=>{
        if(isCheck(this._softDelete)) return reject("this._softDelete is not true!");
        if(isCheck(whereClause(data))) return reject("Where condition is required!");
        try {
          if (sqlConnect(this._connection)) {
            return reject(sqlConnect(this._connection));
          }
          let colunm = await addDeletedAt(this.thisTable(),this._connection);
          if (colunm) {
            this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(data)}`, (err, res) => {
              if (err) {
                return reject(err);
              }
              return resolve(res);
            });
          }
        } catch (error) {
          return reject(error); 
        }
      });
    }
    trashedAll(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      return new Promise( async(resolve,reject)=>{
        if(isCheck(this._softDelete)) return reject("this._softDelete is not true!");
        try {
          if (sqlConnect(this._connection)) {
            return reject(sqlConnect(this._connection));
          }
          let colunm = await addDeletedAt(this.thisTable(),this._connection);
          if (colunm) {
            this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(data)}`, (err, res) => {
              if (err) {
                return reject(err);
              }
              return resolve(res);
            });
          }
        } catch (error) {
          return reject(error); 
        }
      });
    }
    restore(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      return new Promise( async(resolve,reject)=>{
        if(isCheck(this._softDelete)) return reject("this._softDelete is not true!");
        if(isCheck(whereClause(data))) return reject("Where condition is required!");
        this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(data)}`, (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
      });
    }
    restoreAll(data){
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      return new Promise( async(resolve,reject)=>{
        if(isCheck(this._softDelete)) return reject("this._softDelete is not true!");
        this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(data)}`, (err, res) => {
          if (err) {
            return reject(err);
          }
          return resolve(res);
        });
      });
    }
    thisTable(){
      return isCheck(this._table) ? this.constructor.name.toLowerCase()+'s':this._table;
    }
  }
  module.exports = BaseModels;