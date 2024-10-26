const {
  isLatest, isLimit, isTable, isNotObject,
  isObject,isObjectEmpty,isEmpty
} = require('./supporterMethodes');
const {
  addDeletedAt,
  sqlConnect,
  withdataForGet,
  withdata,
  withTable, joinTable, paginationData, pagination, whereClause,
  selectOption, getKeyValue,
} = require('./sqlHandler');
const { collect } = require('./helper');
const QueryBuilder = require('./QueryBuilder');

class BaseModels extends QueryBuilder {
  #list = [];
  constructor(setting = "") {
    super();
    this._table = isEmpty(setting._table) ? false : setting._table;
    this._softDelete = isEmpty(setting._softDelete) ? false : setting._softDelete;
    this._hidden = isEmpty(setting._hidden) ? false : setting._hidden;
    this._show = isEmpty(setting._show) ? false : setting._show;
    this._connection = isEmpty(setting._connection) ? false : setting._connection;
    this.condition=isEmpty(setting.condition) ? {} : setting.condition;
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
        }
        if (isTable(this.thisTable())) return reject(isTable(this.thisTable()));
        let response = [];
        let ob = this.#getQuery(x);

        if (!ob.select) {
          await this.checkProtect(ob);
        }
        this._connection.query(
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
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
                  for (const iterator of res) {
                    const item = await withdataForGet(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  if (response) {
                    return collect(resolve({ response, paginate }));
                  }
                }
              );
            } else {
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, ob, this._connection);
                response.push(item);
              }
              if (response) {
                return collect(resolve(response));
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], ob, this._connection));
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], ob, this._connection));
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], ob, this._connection));
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )}   ${isLatest(ob)} ${isLimit(ob, 1)}`,
          async (err, res) => {
            if (err) {
              return reject(err);
            }
            if (res.length > 0) {
              return resolve(await withdata(reject, res[0], ob, this._connection));
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
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
                    const item = await withdataForGet(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {
              if (isEmpty(ob.with)) return resolve(res);
              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, ob, this._connection);
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
          `SELECT ${selectOption(ob, this)} FROM ${this.thisTable()} ${whereClause(
            ob
          )} ${isLatest(ob)} ${isLimit(ob)} ${pagination(ob)}`,
          async (err, res) => {
            if (err) {
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
                    const item = await withdataForGet(reject, iterator, ob, this._connection);
                    response.push(item);
                  }
                  return resolve({ response, paginate });
                }
              );
            } else {

              if (isEmpty(ob.with)) return resolve(res);

              for (const iterator of res) {
                const item = await withdataForGet(reject, iterator, ob, this._connection);
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
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      if (isEmpty(whereClause(data))) return reject("Where condition is required!");
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
        if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
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
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
      if (isEmpty(whereClause(data))) return reject("Where condition is required!");
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
      if (isEmpty(this._softDelete)) return reject("this._softDelete is not true!");
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

  #handleRelation(t,m,n,cb = false) {
    const tc = isObject(t) ? t : { table: t };
    if (cb && isObject(cb(this))) {
      const itemW = cb !== false  ? cb(this).condition : {};

      const it = cb !== false && cb(this).#list && cb(this).#list[0] ? {w:cb(this).#list[0]}  :  {};

      let tran =this.transform({ method: m, data: { ...tc, ...it, ...n } });
      const keys = Object.keys(tran);
      const values = Object.values(tran);
      // this.#list =[];
      // Use computed property names to dynamically add the key-value pair to the object
      if(itemW.with){
        values[0].with = {
          ...values[0].with,
          ...itemW.with,
        }
      }
      this.#list.push({ method:keys[0],data: {...values[0]} });
    } else {
      this.#list.push({ method: m, data: { ...tc, ...n } });
    }
    return this;
  }
  hasMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
      return this.#handleRelation(t,methodName,{hasMany: x},cb)
  }

  belongsTo(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
      return this.#handleRelation(t,methodName,{belongsTo: x},cb)
  }
  belongsToMany(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
      return this.#handleRelation(t,methodName,{belongsToMany: x},cb)
  }

  connect(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
      return this.#handleRelation(t,methodName,{connect: x},cb)
  }

  hasOne(t, x, cb = false) {
    const methodName = (new Error()).stack.split('\n')[2].trim()
      .split(' ')[1].split('.')[1];
      return this.#handleRelation(t,methodName,{hasOne: x},cb)
  }

  transform(input) {
    try {
      // Base case: if there's no 'method' or 'data' field, return null
      if (!input || !input.method || !input.data) return input;

      // Extract method and data
      const { method, data } = input;

      // Create the base structure for the output
      let output = {
        [method]: {
          table: data.table,
          hasOne: data.hasOne || {},
        }
      };

      // Check if there's nested data (i.e., the 'w' field)
      if (data.w) {
        const nestedMethod = data.w.method;
        output[method].with = {
          [nestedMethod]: this.transform(data.w)[nestedMethod]
        };
      }

      return output;
    } catch (error) {
      return error;
    }
  }
  async setQuery(x, seen = new Set()) {
    const processList = async (list) => {
        if (!list || list.length === 0) return {};

        const results = await Promise.all(list.map(async (item) => {
            const result = {};
            result[item.method] = item.data;

            if (item.w && !seen.has(item.w)) { // Ensure no infinite recursion
                seen.add(item.w); // Mark this item as seen
                result[item.method].with = await this.get(item.w, seen);
            }

            return result;
        }));

        return results.reduce((acc, item) => Object.assign(acc, item), {});
    };

    if (this.#list && this.#list.length > 0) {
        x.with = await processList(this.#list);
    }else{
      x.with = {
        ...x.with,
        ...this.x.with,
      }
      this.x = x;
    }

    return this.x;
  }

  #getQuery(q,check=true){
    Object.assign(this.x , q);
    if (check) {
      this.setQuery(this.x);
    }
    const x = this.x;
    this.x = {};
    return x;
  }
  //end code

}
module.exports = BaseModels;