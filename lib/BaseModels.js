
const {
  isLatest, isLimit, isCheck, isTable, isNotObject,
  isObject, isArray
} = require('./isMethodes');
const {
  addDeletedAt,
  sqlConnect,
  withdataForGet,
  withdata,
  withTable, joinTable, paginationData, pagination, whereClause,
  selectOption, getKeyValue,
} = require('./sqlBuilder');

class BaseModels {
  #list = [];
  constructor(db = "") {
    this._table = false;
    this._softDelete = false;
    this._hidden = false;
    this._show = false;
    this._connection = db;
    this.x={};
  }
  checkProtect(data) {
    return new Promise(async (r, e) => {
      try {
        if (!isCheck(this._hidden) && isCheck(data.select) && isCheck(this._show)) {
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
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        let response = [];
        this.setQuery(x);

        if (!this.x.select) {
          await this.checkProtect(this.x);
        }
        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )} ${isLatest(this.x)} ${isLimit(this.x)} ${pagination(this.x)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (this.x != undefined && (!isCheck(this.x.pagination) || this.x.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${whereClause(
                  this.x
                )} ${isLatest(this.x)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, this.x);
                  for (const iterator of res) {
                    const item = await withdataForGet(reject, iterator, this.x, this._connection);
                    response.push(item);
                  }
                  if (response) {
                    return resolve({ response, paginate });
                  }
                }
              );
            } else {
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, this.x, this._connection);
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
        this.setQuery(x);

        if (!this.x.select) {
          await this.checkProtect(this.x);
        }
        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )}   ${isLatest(this.x)} ${isLimit(this.x, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], this.x, this._connection));
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
        this.setQuery(x);

        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )}   ${isLatest(this.x)} ${isLimit(this.x, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], this.x, this._connection));
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
        this.x.where = isNotObject(x) ? { "id": d } : d;
        this.setQuery(this.x);

        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )}   ${isLatest(this.x)} ${isLimit(this.x, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], this.x, this._connection));
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
        this.x.where = isNotObject(x) ? { "email": d } : d;
        this.setQuery(this.x);

        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )}   ${isLatest(this.x)} ${isLimit(this.x, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], this.x, this._connection));
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
        // console.log("with first awe 1");
        let response = [];
        this.x.where = d;
        this.setQuery(this.x);
        
        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )} ${isLatest(this.x)} ${isLimit(this.x)} ${pagination(this.x)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (this.x != undefined && (!isCheck(this.x.pagination) || this.x.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${whereClause(
                  this.x
                )} ${isLatest(this.x)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, this.x);
                  if (isCheck(this.x.with)) return resolve({ res, paginate });
                  for (const iterator of res) {
                    const item = await withdataForGet(reject, iterator, this.x, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              if (isCheck(this.x.with)) return resolve(res);
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, this.x, this._connection);
                response.push(item);
              }
              return resolve(response);
            }
          }
        );
      } catch (error) {
        return reject("eroor");
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
        // console.log("with first awe 1");
        let response = [];
        this.x.where = isNotObject(x) ? { "id": d } : d;
        this.setQuery(this.x);

        this._connection.query(
          `SELECT ${selectOption(this.x, this)} FROM ${this.thisTable()} ${whereClause(
            this.x
          )} ${isLatest(this.x)} ${isLimit(this.x)} ${pagination(this.x)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (this.x != undefined && (!isCheck(this.x.pagination) || this.x.pagination >= 0)) {
              this._connection.query(
                `SELECT count(*) as totalData FROM ${this.thisTable()} ${whereClause(
                  this.x
                )} ${isLatest(this.x)}`,
                async (err, resp) => {
                  if (err) {
                    return reject(err);
                  }
                  let paginate = paginationData(resp[0].totalData, this.x);
                  if (isCheck(this.x.with)) return resolve({ res, paginate });
                  for (const iterator of res) {
                    const item = await withdataForGet(reject, iterator, this.x, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              // console.log("with first");
              if (isCheck(this.x.with)) return resolve(res);
              // console.log("with");
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, this.x, this._connection);
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
  dbJoin(data) {
    return new Promise((resolve, reject) => {
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        this._connection.query(
          `SELECT ${selectOption(data, this)} FROM ${this.thisTable()} ${joinTable(
            data.join
          )} ${whereClause(data)} ${isLatest(data)} ${isLimit(
            data
          )} ${pagination(data)}`,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            if (data != undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
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
              return reject(err);
            }
            if (data != undefined && (!isCheck(data.pagination) || data.pagination >= 0)) {
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
        if (data.elements != undefined && data.elements != null) {
          let keys = Object.keys(data.elements).toString();
          let values = Object.values(data.elements).toString();
          this._connection.query(
            `INSERT INTO ${this.thisTable()} (${keys}) VALUES (${values})`,
            (err, res) => {
              if (err) {
                return reject(err);
              }
              if (res) {
                return resolve(res);
              }
            }
          );
        } else {
          return resolve(true);
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
        if (data.elements != undefined && data.elements != null) {
          var sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(
            data.elements,
            "SET"
          )} ${whereClause(data)}`;
          this._connection.query(sqlQuery, (err, res) => {
            if (err) {
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
          const checkQuery = `SELECT COUNT(*) AS count FROM ${this.thisTable()} ${whereClause(x)}`;
          console.log("whereClause(x)", whereClause(x));

          this._connection.query(checkQuery, (err, result) => {
            if (err) {
              return reject(err);
            }

            const recordExists = whereClause(x) != "" ? result[0].count > 0 : false;

            let sqlQuery;

            if (recordExists) {
              sqlQuery = `UPDATE ${this.thisTable()} ${getKeyValue(x.elements, "SET")} ${whereClause(x)}`;
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
      if (data.where != undefined) {
        this._connection.query(
          `DELETE FROM ${this.thisTable()} ${whereClause(data)}`,
          (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res) {
              return resolve(res);
            }
          }
        );
      }
    });
  };
  delete(data) {
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
            if (res) {
              return resolve(res);
            }
          }
        );
      }
    });
  };
  deleleAll(data) {
    if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
    return new Promise((resolve, reject) => {
      if (sqlConnect(this._connection)) {
        return reject(sqlConnect(this._connection));
      }
      this._connection.query(`DELETE FROM ${this.thisTable()} ${whereClause(data)}`, (err, res) => {
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
      if (isCheck(this._softDelete)) return reject("this._softDelete is not true!");
      if (isCheck(whereClause(data))) return reject("Where condition is required!");
      try {
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        let colunm = await addDeletedAt(this.thisTable(), this._connection);
        if (colunm) {
          this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(data)}`, (err, res) => {
            if (err) {
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
        if (isCheck(this._softDelete)) return reject("this._softDelete is not true!");
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        let colunm = await addDeletedAt(this.thisTable(), this._connection);
        if (colunm) {
          this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NOW() ${whereClause(data)}`, (err, res) => {
            if (err) {
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
      if (isCheck(this._softDelete)) return reject("this._softDelete is not true!");
      if (isCheck(whereClause(data))) return reject("Where condition is required!");
      this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(data)}`, (err, res) => {
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
      if (isCheck(this._softDelete)) return reject("this._softDelete is not true!");
      this._connection.query(`UPDATE ${this.thisTable()} SET deleted_at = NULL ${whereClause(data)}`, (err, res) => {
        if (err) {
          return reject(err);
        }
        if (res) {
          return resolve(res);
        }
      });
    });
  }
  thisTable() {
    return isCheck(this._table) ? this.constructor.name.toLowerCase() + 's' : this._table;
  }
  exists(x) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
        data.where = isNotObject(x) ? { "email": x } : x;
        //
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        this._connection.query(
          `SELECT EXISTS(SELECT 1 FROM ${this.thisTable()} ${whereClause(
            data
          )} ${isLatest(data)} ${isLimit(data)} ${pagination(data)}) AS exist`,
          async (err, res) => {
            if (err) {
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
  
  setQuery(x) {
    if (this.#list && this.#list.length > 0) {
      x.with = this.#list.reduce((acc, item) => {
        if (isObject(x.with)) {
          x.with[item.method] = item.data;
          return x.with;
        } else {
          acc[item.method] = item.data;
          return acc;
        }
      }, {});
    }
    this.x = x
    return this;
  }

  hasMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      this.#list.push({ method: methodName, data: { ...tc, ...cb(this), hasMany: x } });
    } else {
      this.#list.push({ method: methodName, data: { ...tc, hasMany: x } });
    }
    return this;
  }

  belongsTo(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      this.#list.push({ method: methodName, data: { ...tc, ...cb(this), belongsTo: x } });
    } else {
      this.#list.push({ method: methodName, data: { ...tc, belongsTo: x } });
    }
    return this;
  }
  belongsToMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      this.#list.push({ method: methodName, data: { ...tc, ...cb(this), belongsToMany: x } });
    } else {
      this.#list.push({ method: methodName, data: { ...tc, belongsToMany: x } });
    }
    return this;
  }
  connect(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      this.#list.push({ method: methodName, data: { ...tc, ...cb(this), connect: x } });
    } else {
      this.#list.push({ method: methodName, data: { ...tc, connect: x } });
    }
    return this;
  }
  hasOne(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      this.#list.push({ method: methodName, data: { ...tc, ...cb(this), hasOne: x } });
    } else {
      this.#list.push({ method: methodName, data: { ...tc, hasOne: x } });
    }
    return this;
  }
  slug(slug, x = {}) {
    return new Promise(async (resolve, reject) => {
      try {
        let data = {};
        data.where = isNotObject(x) ? { "slug": x } : x;
        if (sqlConnect(this._connection)) {
          return reject(sqlConnect(this._connection));
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        if (await this.exists(x)) {

        } else {

        }
      } catch (error) {
        return reject(error);
      }
    });
  }
  options(x) {
    return x;
  }
}
module.exports = BaseModels;