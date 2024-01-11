"use strict";

const { sqlForPartialUpdate, sqlForSearch } = require("./sql");
const { BadRequestError } = require("../expressError");


describe("sqlForPartialUpdate", function () {
  test("works with partial data that is valid", function () {
    const { setCols, values } = sqlForPartialUpdate(
      {
        "firstName": "Bob",
        "lastName": "Laster"
      },
      {
        firstName: "first_name",
        lastName: "last_name",
      });


    expect(setCols).toEqual('"first_name"=$1, "last_name"=$2');
    expect(values).toEqual(["Bob", "Laster"]);
  });


  test("works with full data that is valid", function () {
    const { setCols, values } = sqlForPartialUpdate(
      {
        "firstName": "Bob",
        "lastName": "Laster",
        "email": "bob@laster.com",
        "isAdmin": true
      },
      {
        firstName: "first_name",
        lastName: "last_name",
        isAdmin: "is_admin"
      });

    expect(setCols)
      .toEqual('"first_name"=$1, "last_name"=$2, "email"=$3, "is_admin"=$4');
    expect(values).toEqual(["Bob", "Laster", "bob@laster.com", true]);
  });


  test("bad request with no data", function () {

    expect(() => sqlForPartialUpdate({},
      {
        firstName: "first_name",
        lastName: "last_name",
      })).toThrow(BadRequestError);
  });
});

//// Tests for sqlSearch /////

describe("sqlForSearch", function () {
  test("works with valid data", function () {
    const whereClause = sqlForSearch(
      {
        "nameLike": "C",
        "minEmployees": "2"
      },
      {

      });


    expect(whereClause).toEqual("WHERE name ILIKE '%C%' AND num_employees >= 2");
  });


  test("works with min and max values", function () {
    const whereClause  = sqlForSearch(
      {
        "minEmployees": "2",
        "maxEmployees": "100",
      },
      {
        nameLike: "name",
        numEmployees: "num_employees",
      });

    expect(whereClause).toEqual('WHERE num_employees >= 2 AND num_employees <= 100');

  });

  // //TODO: test for
  //   Expected: "WHERE name ILIKE '%C%' AND num_employees >= 2"
  //   Received: "WHERE name ILIKE '%C%' num_employees >= 2"

  // test("bad request with no data", function () {

  //   expect(() => sqlForPartialUpdate({},
  //     {
  //       firstName: "first_name",
  //       lastName: "last_name",
  //     })).toThrow(BadRequestError);
  // });
});