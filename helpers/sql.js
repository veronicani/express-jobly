"use strict";

const { BadRequestError } = require("../expressError");

//TODO: THIS NEEDS SOME GREAT DOCUMENTATION.

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
      `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

module.exports = { sqlForPartialUpdate };

//Walkthrough of sqlForPartialUpdate
// data {firstName: "Bob", 'lastName: "Laster", 'isAdmin: true}
// keys = [firstName, lastName, isAdmin] (these are colNames), length = 3
// if keys.length = 0 -> Err
//cols = ["first_name" OR firstName" = $1, "last_name" OR lastName = $2]
//returns
//{setCols: "first_name = $1, last_name = $2"
// values: ["Bob", "Laster", true]
