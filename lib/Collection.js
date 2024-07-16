const { getNestedValue } = require("./supporterMethodes");

class Collection extends Array {
  constructor(items = []) {
    if (Array.isArray(items)) {
      super(...items);
    } else {
      super();
    }
  }

  map(callback) {
    return new Collection(super.map(callback));
  }

  filter(callback) {
    return new Collection(super.filter(callback));
  }

  reduce(callback, initialValue) {
    return super.reduce(callback, initialValue);
  }

  find(callback) {
    return super.find(callback);
  }

  push(item) {
    super.push(item);
    return this;
  }

  pluck(key) {
    return new Collection(this.map(item => getNestedValue(item, key)));
  }

  values(key) {
    return this.pluck(key).toArray();
  }

  keys() {
    const allKeys = this.reduce((keys, item) => {
      Object.keys(item).forEach(key => keys.add(key));
      return keys;
    }, new Set());
    return new Collection([...allKeys]);
  }

  where(key, operator, value=false) {
  let comparisonFunction;
  switch (operator) {
    case '=':
    case '==':
      comparisonFunction = item => getNestedValue(item, key) == value;
      break;
    case '!=':
    case '<>':
      comparisonFunction = item => getNestedValue(item, key) != value;
      break;
    case '<':
      comparisonFunction = item => getNestedValue(item, key) < value;
      break;
    case '<=':
      comparisonFunction = item => getNestedValue(item, key) <= value;
      break;
    case '>':
      comparisonFunction = item => getNestedValue(item, key) > value;
      break;
    case '>=':
      comparisonFunction = item => getNestedValue(item, key) >= value;
      break;
    default:
      comparisonFunction = item => getNestedValue(item, key) == operator;
      break;
  }

  return new Collection(this.filter(comparisonFunction));
}


  whereOr(...conditions) {
  const filteredItems = this.filter(item => 
    conditions.some(([key, operator, value]) => {
      switch (operator) {
        case '=':
        case '==':
          return getNestedValue(item, key) == value;
        case '!=':
        case '<>':
          return getNestedValue(item, key) != value;
        case '<':
          return getNestedValue(item, key) < value;
        case '<=':
          return getNestedValue(item, key) <= value;
        case '>':
          return getNestedValue(item, key) > value;
        case '>=':
          return getNestedValue(item, key) >= value;
        default:
          return getNestedValue(item, key) == operator;
      }
    })
  );

  return new Collection(filteredItems);
}


  whereIn(key, values) {
  return new Collection(this.filter(item => values.includes(getNestedValue(item, key))));
}


  whereNotIn(key, values) {
  return new Collection(this.filter(item => !values.includes(getNestedValue(item, key))));
}


  whereNull(key) {
  return new Collection(this.filter(item => getNestedValue(item, key) === null || getNestedValue(item, key) === undefined));
}


  whereNotNull(key) {
  return new Collection(this.filter(item => getNestedValue(item, key) !== null && getNestedValue(item, key) !== undefined));
}

  sortBy(key) {
    return new Collection([...this].sort((a, b) => (a[key] > b[key] ? 1 : -1)));
  }

  orderBy(key, direction = 'asc') {
    const sortedItems = [...this].sort((a, b) => {
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      return 0;
    });
    return new Collection(sortedItems);
  }

  chunk(size) {
    const chunks = [];
    for (let i = 0; i < this.length; i += size) {
      chunks.push(this.slice(i, i + size));
    }
    return new Collection(chunks);
  }

  sum(key) {
    return this.reduce((total, item) => total + item[key], 0);
  }

  avg(key) {
    return this.sum(key) / this.length;
  }

  groupBy(key) {
    return this.reduce((groups, item) => {
      const group = item[key];
      if (!groups[group]) {
        groups[group] = [];
      }
      groups[group].push(item);
      return groups;
    }, {});
  }

  first() {
    return this[0];
  }

  last() {
    return this[this.length - 1];
  }

  contains(value) {
    return this.includes(value);
  }

  unique() {
    return new Collection([...new Set(this)]);
  }

  count() {
    return this.length;
  }

  isEmpty() {
    return this.length === 0;
  }

  flat(depth = 1) {
    return new Collection(super.flat(depth));
  }

  each(callback) {
    this.forEach(callback);
    return this;
  }

  take(number) {
    return new Collection(this.slice(0, number));
  }

  takeLast(number) {
    return new Collection(this.slice(-number));
  }

  slice(start, end) {
    return new Collection(super.slice(start, end));
  }

  reverse() {
    return new Collection([...this].reverse());
  }

  splice(start, deleteCount, ...items) {
    const splicedItems = [...this];
    splicedItems.splice(start, deleteCount, ...items);
    return new Collection(splicedItems);
  }

  paginate(perPage, currentPage = 1) {
    const totalItems = this.length;
    const totalPages = Math.ceil(totalItems / perPage);
    const offset = (currentPage - 1) * perPage;
    const paginatedItems = this.slice(offset, offset + perPage);

    return {
      data: new Collection(paginatedItems),
      currentPage,
      perPage,
      totalItems,
      totalPages,
      from: offset + 1,
      to: offset + paginatedItems.length,
    };
  }

  flatten() {
    const flattenDeep = arr =>
      arr.reduce((acc, val) =>
        Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), []);
    return new Collection(flattenDeep(this));
  }

  except(keys) {
    return new Collection(this.map(item => {
      const newItem = { ...item };
      keys.forEach(key => {
        delete newItem[key];
      });
      return newItem;
    }));
  }

  only(keys) {
    return new Collection(this.map(item => {
      const newItem = {};
      keys.forEach(key => {
        if (item[key] !== undefined) {
          newItem[key] = item[key];
        }
      });
      return newItem;
    }));
  }

  keyBy(key) {
    const keyedObject = this.reduce((acc, item) => {
      acc[item[key]] = item;
      return acc;
    }, {});
    return new Collection(Object.values(keyedObject));
  }

  tap(callback) {
    callback(this);
    return this;
  }

  intersect(array) {
    const intersected = this.filter(item => array.includes(item));
    return new Collection(intersected);
  }

  diff(array) {
    const difference = this.filter(item => !array.includes(item));
    return new Collection(difference);
  }
  toArray() {
    return [...this];
  }
}
module.exports = Collection;