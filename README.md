# kp-mysql-models

>The `kp-mysql-models` library simplifies interactions with MySQL databases. It streamlines tasks such as creating, inserting, updating, and deleting records, and handles complex operations like joins, pagination, and conditionals. Its intuitive and efficient approach can greatly expedite development, saving both time and effort.


> import all method.

```const {
  setBDConnection,
  get,
  first,
  save,
  create,
  update,
  dbJoin,
  dbWith,
} = require("kp-mysql-models");```


>first you have to setup mysql connection call setBDConnection() method to connect database with lib.

```
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
* get,
* first,
* save,
* create,
* update,
* dbJoin,
* dbWith,. 

>***Exmaples**

***first method for geting single data***
```
const data = await first{
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
```
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
***dbJoin for using mysql all types join***
```
const dataj = await dbJoin({
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