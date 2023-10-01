# kp-mysql-models

>The `kp-mysql-models` is a mysql query builder library that simplifies interactions with MySQL databases. It streamlines tasks such as creating, inserting, updating, and deleting records, and handles complex operations like joins, pagination, and conditionals. Its intuitive and efficient approach can greatly expedite development, saving both time and effort.

>***install using cmd*** npm i kp-mysql-models **Or** npm i @krishnapawar/kp-mysql-models


> import all method.

```JavaScript
const {
  setBDConnection,
  get,
  first,
  save,
  create,
  update,
  dbJoin,
  dbWith,
} = require("kp-mysql-models");
```


>first you have to setup mysql connection call setBDConnection() method to connect database with lib.

```JavaScript
var mysql = require("mysql");
var pool = mysql.createPool({
  connectionLimit: 10,
  host: "localhost",
  user: "root",
  password: "",
  database: "test",
});

setBDConnection(pool);
```
>after that use (call) all methods like 
***
>**Somme important methods**
* setBDConnection,
* get,
* first,
* dbQuery,
* trunCate,
* deleleAll,
* destroy,
* create,
* update,
* save,
* dbJoin,
* dbWith,

>**Exmaples**

***first method for geting single data***
```JavaScript
const data = await first({
      table: "users",
      select: ["id", "first_name", "last_name"],
      limit: 10,
      latest: "id",
      whereNotIn: {
        id: [1, 1221],
      },
      whereIs: {
        last_name: "NULL",
      },
      where:{
        id:1
      }
    });
```
***get methods***
```JavaScript
const data = await get({
      table: "users",
      select: ["id", "first_name", "last_name"],
      limit: 10,
      latest: "id",
      whereNotIn: {
        id: [1, 1221],
      },
      whereIs: {
        last_name: "NULL",
      },
    });

```
***we can make dyanamic pagination with key word (pagination:1) 1 is page No. we can set page limit by (limit:10) key word 10 is 10 data per page***
 
```JavaScript
const data = await get({
      table: "users",
      limit: 10,      
      pagination: 1,
    });
```
***dbJoin for using mysql all types join***
```JavaScript
let page = req.query.page;
```
```JavaScript
const data = await dbJoin({
      table: "users",
      limit: 10,
      select: [
        "users.id as uId",
        "appointments.id",
        "users.first_name",
        "lab.first_name as lab_name",
      ],
      latest: "appointments.id",
      join: [
        {
          type: "hasOne",
          table: "appointments",
          on: {
            "users.id": "appointments.patient_id",
          },
        },
        {
          type: "belongsTo",
          table: "users lab",
          on: {
            "lab.id": "appointments.user_id",
          },
        },
      ],
      where: {
        "users.id": 1122,
      },
      pagination: page,
    });
```

***you can also use for this method for join mutipal table***

```JavaScript
const data = await dbWith({
      table: "users",
      limit: 10,
      select: [
        "users.id as uId",
        "appointments.id",
        "users.first_name",
        "lab.first_name as lab_name",
      ],
      latest: "appointments.id",
      with: {
        hasOne: [
          {
            table: "appointments",
            on: {
              "users.id": "appointments.patient_id",
            },
          },
          {
            table: "users clinic",
            on: {
              "clinic.id": "appointments.clinic_id",
            },
          },
        ],
        belongsTo: [
          {
            table: "users lab",
            on: {
              "lab.id": "appointments.user_id",
            },
          },
        ],
      },
      where: {
        "users.id": 1122,
      },
      pagination: page,
    });
```

***using with() method using with first method to fetch data in specific variable in object***

```JavaScript
const data = await first({
      table: "users",
      select: ["id", "first_name", "last_name"],
      with: {
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            user_id: "id",
          },
        },
        clinic: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            doctor_id: "id",
          },
        },
      },
      where: {
        id: 585,
      },
    });
```
***using with() method using with get method to fetch data in specific variable in object***

```javaScript
const data = await get({
      table: "users",
      select: ["id", "created_by_id", "first_name", "last_name"],
      with: {
        doctor: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            user_id: "id",
          },
        },
        clinic: {
          table: "appointments",
          limit: 2,
          select: ["id", "user_id"],
          connect: {
            doctor_id: "id",
          },
        },
      },
      where: {
        created_by_id: "1",
      },
    }); 
```

***create method using for create data***
```JavaScript
const data = await create({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      }
    });
```
***update method using for updating data***
```JavaScript
const dataj = await update({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      where: {
        id: 1223,
      }
    });
```

***save method using for create or updating data***
```JavaScript
const dataj = await save({
      table: "users",
      elements: {
        first_name: "ram",
        last_name: "ji",
      },
      // where: {
      //   id: 1223,
      // },
    });
```

***some usefull method that can help with that method***
***
where opration
---
```JavaScript
where: {
        id: 1223,
      }

*********************************

whereOr: {
        id: 1223,
      }

*********************************
whereIn: {
        id: [1, 1221],
      },

*********************************

whereNotIn: {
        id: [1, 1221],
      },

*********************************

whereIs: {
    last_name: "NULL",
},

*********************************

whereIsNot: {
        last_name: "NULL",
      },

*********************************

whereRaw:"name='mohan' and age=30 "
```

where opration
---
```JavaScript
on: {
        id: 1223,
      }

*********************************

onOr: {
        id: 1223,
      }

*********************************

onIn: {
        id: [1, 1221],
      },

*********************************

onNotIn: {
        id: [1, 1221],
      },

*********************************

onIs: {
    last_name: "NULL",
},

*********************************

onIsNot: {
        last_name: "NULL",
      },

*********************************

onRaw:"name='mohan' and age=30 "
```