const {
  isLatest, isLimit, isTable, isNotObject,
  isObject,isObjectEmpty,isEmpty
} = require('./supporterMethodes');
const {
  addDeletedAt,
  sqlConnect,
  getDataWith,
  withTable, joinTable, paginationData, pagination, whereClause,
  selectOption, getKeyValue,
} = require('./sqlHandler');
const { errorWatcher } = require('./helper');
const QueryBuilder = require('./QueryBuilder');
const { migrateSchema } = require('./Migration');

class BaseModels extends QueryBuilder {
  constructor(setting = "") {
    super();
    this._table = isEmpty(setting._table) ? false : setting._table;
    this._softDelete = isEmpty(setting._softDelete) ? false : setting._softDelete;
    this._hidden = isEmpty(setting._hidden) ? false : setting._hidden;
    this._show = isEmpty(setting._show) ? false : setting._show;
    this._connection = isEmpty(setting._connection) ? isEmpty(setting) ? false : setting : setting._connection;
    this.condition=isEmpty(setting.condition) ? {} : setting.condition;
    this._schema = false;
    this._isProduction =false;
  }

  checkProtect(data) {
    return new Promise(async (r, e) => {
      try {
        if (!isEmpty(this._hidden) && isEmpty(data.select) && isEmpty(this._show)) {
          const selectD = await this.dbQuery(`DESCRIBE ${this.thisTable()}`);
          data.select = selectD
            .map((x) => x.Field)
            .filter((x) => !this._hidden.includes(x));
          if (data.select) {
            return r(data);
          }
        } else {
          return r(data);
        }
      } catch (error) {
        return e(error);
      }
    })
  }
  //start
  get(x = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }isTable
        if (isTable(this.thisTable())) return reject((this.thisTable()));
        let response = [];
        let ob = this.#getQuery(x);

        if (!ob.select) {
          await this.checkProtect(ob);
        }
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (ob != undefined && (!isEmpty(ob.pagination) || ob.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${joinTable(
                  ob
                )} ${whereClause(
                  ob
                )} ${isLatest(ob)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, ob);
                  for (const iterator of res) {
                    const item = await getDataWith(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  if (response) {
                    return resolve({ response, paginate });
                  }
                }
              );
            } else {
              for (const iterator of res) {
                const item = await getDataWith(reject, iterator, ob, this._connection);
                response.push(item);
              }
              if (response) {
                return resolve(response);
              }
            }
          }
        );
      } catch (error) {
        return reject(error);
      }

    });
  };
  //start
  first(x = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        let ob = this.#getQuery(x);
        if (!ob.select) {
          await this.checkProtect(ob);
        }
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await getDataWith(reject, res[0], ob, this._connection));
            }
            return resolve({});
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };
  //start
  findOne(x = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        x =isEmpty(x) ? this.x : {where: x };
        let ob = this.#getQuery(x);
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await getDataWith(reject, res[0], ob, this._connection));
            }
            return resolve({});
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };
  findOneById(d) {
    return new Promise(async (resolve, reject) => {
      try {
        d =isEmpty(d) ? this.x : isNotObject(d) ? {where:{ "id": d }}: {where: d };
        let ob = this.#getQuery(d);
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await getDataWith(reject, res[0], ob, this._connection));
            }
            return resolve({});
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };
  findOneByEmail(d) {
    return new Promise(async (resolve, reject) => {
      try {
        d =isEmpty(d) ? this.x : isNotObject(d) ? {where:{ "email": d }}: {where: d };
        let ob = this.#getQuery(d);

        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await getDataWith(reject, res[0], ob, this._connection));
            }
            return resolve({});
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };
  find(d = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = sqlConnect(this._connection);
        if (connection) {
          return reject(connection);
        }

        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));

        let response = [];
        d =isEmpty(d) || isObjectEmpty(d) ? this.x : isEmpty(d.where) ?  {where: d } : d;
        let ob = this.#getQuery(d);
        
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (ob != undefined && (!isEmpty(ob.pagination) || ob.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${joinTable(
                  ob
                )} ${whereClause(
                  ob
                )} ${isLatest(ob)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, ob);
                  if (isEmpty(ob.with)) return resolve({ res, paginate });
                  for (const iterator of res) {
                    const item = await getDataWith(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              if (isEmpty(ob.with)) return resolve(res);
              for (const iterator of res) {
                const item = await getDataWith(reject, iterator, ob, this._connection);
                response.push(item);
              }
              return resolve(response);
            }
          }
        );
      } catch (error) {
        return reject("eroor find=>",error);
      }
    });
  };
  findAll(d = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = sqlConnect(this._connection);
        if (connection) {
          return reject(connection);
        }

        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));

        let response = [];
        d =isEmpty(d) || isObjectEmpty(d) ? this.x : isEmpty(d.where) ?  {where: d } : d;
        let ob = this.#getQuery(d);
        
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (ob != undefined && (!isEmpty(ob.pagination) || ob.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${joinTable(
                  ob
                )} ${whereClause(
                  ob
                )} ${isLatest(ob)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, ob);
                  if (isEmpty(ob.with)) return resolve({ res, paginate });
                  for (const iterator of res) {
                    const item = await getDataWith(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              if (isEmpty(ob.with)) return resolve(res);
              for (const iterator of res) {
                const item = await getDataWith(reject, iterator, ob, this._connection);
                response.push(item);
              }
              return resolve(response);
            }
          }
        );
      } catch (error) {
        return reject("eroor find=>",error);
      }
    });
  };
  findById(d) {
    return new Promise(async (resolve, reject) => {
      try {
        const connection = sqlConnect(this._connection);
        if (connection) {
          return reject(connection);
        }

        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));

        let response = [];
        d =isEmpty(d) ? this.x : isNotObject(d) ? {where:{ "id": d }}: {where: d };
        let ob = this.#getQuery(d);

        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob
          )} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (ob != undefined && (!isEmpty(ob.pagination) || ob.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${whereClause(
                  ob
                )} ${isLatest(ob)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, ob);
                  if (isEmpty(ob.with)) return resolve({ res, paginate });
                  for (const iterator of res) {
                    const item = await getDataWith(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {

              if (isEmpty(ob.with)) return resolve(res);

              for (const iterator of res) {
                const item = await getDataWith(reject, iterator, ob, this._connection);
                response.push(item);
              }
              return resolve(response);
            }
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };

  dbQuery(sql) {
    return new Promise((resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        } else {
          this._connection.query(sql, function (error, results) {
            if (error) return reject(error);
            if (results) return resolve(results);
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  };
  dbJoin(x={}) {
    return new Promise((resolve, reject) => {
      try {
        let ob = this.#getQuery(x,false);
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${joinTable(
            ob.join
          )} ${whereClause(ob)} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          (err, response) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (ob != undefined && (!isEmpty(ob.pagination) || ob.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${joinTable(
                  ob.join
                )} ${whereClause(ob)} ${isLatest(ob)}`,
                (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, ob);

                  return resolve({ response, paginate });
                }
              );
            } else if (response) {
              return resolve(response);
            }
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };
  dbWith(data) {
    return new Promise((resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(
          `SELECT ${selectOption(data, this)} FROM ${this.thisTable()} ${withTable(
            data.with
          )}  ${whereClause(data)} ${isLatest(data)} ${isLimit(
            data
          )} ${pagination(data)}`,
          (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (data != undefined && (!isEmpty(data.pagination) || data.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${withTable(
                  data.with
                )} ${whereClause(data)} ${isLatest(data)}`,
                (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, data);
                  if (res && paginate) {
                    return resolve({ res, paginate });
                  }
                }
              );
            } else if (res) {
              return resolve(res);
            }
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  };

  create(data) {
    return new Promise((resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (data != undefined && data != null) {
		      const keys = Object.keys(data).join(', ');
          const values = Object.values(data).map(value => `'${value}'`).join(", ");

          this._connection.query(
            `INSERT INTO ${this.thisTable()} (${keys}) VALUES (${values})`,
            async(err, res) => {
              if (err) {
                return reject(err);
              }
              if (res) {
                try {
                  const insertId = await this.findOneById({ id: res.insertId })
                  return resolve(insertId);
                } catch (error) {
                  return resolve(error);
                }
              }
            }
          );
        } else {
          return reject(new Error("No data provided for insertion."));
        }
      } catch (error) {
        return reject(error);
      }
    });
  };
  save(data) {
    return new Promise((resolve, reject) => {
      try {
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
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res) {
              return resolve(res);
            }
          });
        } else {
          return reject({message:"please check data elements null or undefinded"});
        }
      } catch (error) {
        return reject(error);
      }
    });
  };

  update(data) {
    return new Promise(async (resolve, reject) => {
      try {
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if ((data.elements != undefined && data.elements != null) || isObject(data)) {
          var sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(
            data.elements ?? data,
            "SET"
          )} ${whereClause(this.#getQuery(data))}`;
          
          this._connection.query(sqlQuery, (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res) {
              return resolve(res);
            }
          });
        } else {
          return resolve(true);
        }
      } catch (error) {

      }
    });
  };
  updateOrCreate(x) {
    return new Promise((resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }

        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));

        if (x.elements != undefined && x.elements != null) {
          const checkQuery = `SELECT COUNT(*) AS count FROM ${this.thisTable()} ${whereClause(this.#getQuery(x))}`;

          this._connection.query(checkQuery, (err, result) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }

            const recordExists = whereClause(this.#getQuery(x)) != "" ? result[0].count > 0 : false;

            let sqlQuery;

            if (recordExists) {
              sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(x.elements, "SET")} ${whereClause(this.#getQuery(x))}`;
            } else {
              const keys = Object.keys(x.elements).join(", ");
              const values = Object.values(x.elements).map(value => `'${value}'`).join(", ");
              sqlQuery = `INSERT INTO ${this.thisTable()} (${keys}) VALUES (${values})`;
            }
            this._connection.query(sqlQuery, (err, res) => {
              if (err) {
                return reject(err);
              }
              return resolve(res);
            });
          });
        } else {
          return resolve(true);
        }
      } catch (error) {
        return reject(error);
      }
    });
  };
  // use try and catch
  destroy(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      if (isEmpty(whereClause(this.#getQuery(data)))) return reject("Where condition is required!");
      this._connection.query(
        `DELETE FROM ${this.thisTable()} ${whereClause(this.#getQuery(data))}`,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          if (res) {
            return resolve(res);
          }
        }
      );
    });
  };
  delete(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      if (isEmpty(whereClause(this.#getQuery(data)))) return reject("Where condition is required!");
      this._connection.query(
        `DELETE FROM ${this.thisTable()} ${whereClause(this.#getQuery(data))}`,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          if (res) {
            return resolve(res);
          }
        }
      );
    });
  };
  deleleAll(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      this._connection.query(`DELETE FROM ${this.thisTable()} ${whereClause(this.#getQuery(data))}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          return resolve(res);
        }
      });
    });
  };
  trunCate(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      this._connection.query(`TRUNCATE TABLE ${this.thisTable()}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          return resolve(res);
        }
      });
    });
  };
  trashed(data) {
    return new Promise(async (resolve, reject) => {
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      if (isEmpty(whereClause(this.#getQuery(data)))) return reject("Where condition is required!");
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        let colunm = await addDeletedAt(this.thisTable(), this._connection);
        if (colunm) {
          this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(this.#getQuery(data))}`, (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res) {
              return resolve(res);
            }
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }
  trashedAll(data) {

    return new Promise(async (resolve, reject) => {
      try {
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        let colunm = await addDeletedAt(this.thisTable(), this._connection);
        if (colunm) {
          this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(this.#getQuery(data))}`, (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res) {
              return resolve(res);
            }
          });
        }
      } catch (error) {
        return reject(error);
      }
    });
  }
  restore(data) {

    return new Promise(async (resolve, reject) => {
      if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      if (isEmpty(whereClause(this.#getQuery(data)))) return reject("Where condition is required!");
      this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(this.#getQuery(data))}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          return resolve(res);
        }
      });
    });
  }
  restoreAll(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    if (sqlConnect(this._connection)) {
      return reject(sqlConnect(this._connection));
    }
    return new Promise(async (resolve, reject) => {
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(this.#getQuery(data))}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          return resolve(res);
        }
      });
    });
  }
  clearTrash(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      this._connection.query(
        `DELETE FROM ${this.thisTable()} ${whereClause(this.#getQuery(Object.assign(data??{},{whereNotNull:["deleted_at"]})))}`,
        (err, res) => {
          if (err) {
            return reject(err);
          }
          if (res) {
            return resolve(res);
          }
        }
      );
    });
  };
  thisTable() {
    return isEmpty(this._table) ? this.constructor.name.replace(/([A-Z])/g, '_$1').toLowerCase().slice(1)+'s' : this._table;
  }
  exists(x) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
    
        data =isEmpty(x) ? this.x : {where: x };
        Object.assign(this.x , data);
        let ob = this.#getQuery(x);
        //
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT EXISTS(SELECT 1 FROM ${this.thisTable()} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}) AS exist`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0 && res[0].exist == 1) {
              return resolve(true);
            }
            return resolve(false);
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  }
  count(x) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
    
        data =isEmpty(x) ? this.x : {where: x };
        Object.assign(this.x , data);
        let ob = this.#getQuery(x);
        //
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT count(*) as count FROM ${this.thisTable()} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)})`,
          async (err, res) => {
            if (err) {
              errorWatcher({error:err,status:true,table:this.thisTable(),con:this._connection});
              return reject(err);
            }
            if (res.length > 0 && res[0].count) {
              return resolve(res[0].count);
            }
            return resolve(0);
          }
        );
      } catch (error) {
        return reject(error);
      }
    });
  }
  setQuery(x) {
    x.with = {
      ...this.getConfigList(),
      ...x.with,
      ...this.x.with,
    }
    this.x = x;

    return this.x;
  }
  async #migrate(){
    try {
      
      if(!isEmpty(this._schema) && isEmpty(this._isProduction)){
        let sql = migrateSchema(this.thisTable(),this._schema);
        if(!isEmpty(sql)){
          await this.dbQuery(sql);
        }
      }
    } catch (error) {
      console.log("error=>",error);
    }
  }
  #getQuery(q,check=true){
    this.#migrate();
    if(!isEmpty(q)){
      Object.assign(this.x , q);
    }
    if (check) {
      this.setQuery(this.x);
    }
    const x = this.x;
    this.x = {};
    this.setConfigList({});
    return x;
  }
  //end code

}
module.exports = BaseModels;