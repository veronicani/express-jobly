"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for companies. */

class Company {
  /** Create a company (from data), update db, return new company data.
   *
   * data should be { handle, name, description, numEmployees, logoUrl }
   *
   * Returns { handle, name, description, numEmployees, logoUrl }
   *
   * Throws BadRequestError if company already in database.
   * */

  static async create({ handle, name, description, numEmployees, logoUrl }) {
    const duplicateCheck = await db.query(`
        SELECT handle
        FROM companies
        WHERE handle = $1`, [handle]);

    if (duplicateCheck.rows[0])
      throw new BadRequestError(`Duplicate company: ${handle}`);

    const result = await db.query(`
                INSERT INTO companies (handle,
                                       name,
                                       description,
                                       num_employees,
                                       logo_url)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING
                    handle,
                    name,
                    description,
                    num_employees AS "numEmployees",
                    logo_url AS "logoUrl"`, [
      handle,
      name,
      description,
      numEmployees,
      logoUrl,
    ],
    );
    const company = result.rows[0];

    return company;
  }

  /** Receives a query string object and returns an object with 2
   * keys-value pairs:
   * a generated WHERE SQL clause based on the keys from the query object
   * and an array of values mapping to the query values.
   *
   * This will be used to filter the search in the findAll() method for
   * companies if search queries are passed in.
   *
   * Query must contain at least one of the following:
   * nameLike, minEmployees, maxEmployees.
   *
   * Receives an obj like:
   *  {
   *    nameLike: "C"
   *    minEmployees: "2"
   * }
   *
   * Returns obj like:
   *
   * {
   *    whereClause: "WHERE name ILIKE $1 AND num_employees >= $2",
   *    values: ["%C%", 2]
   * }
   *
  */

  static _makeWhereClause(query) {

    if (query.minEmployees && query.maxEmployees) {
      if (Number(query.minEmployees) > Number(query.maxEmployees)) {
        throw new BadRequestError(
          "Min employees cannot be greater than max employees");
      }
    }

    const whereExps = [];
    const values = [];

    if (query.nameLike) {
      values.push(`%${query.nameLike}%`);
      whereExps.push(`name ILIKE $${values.length}`);
    }

    if (query.minEmployees) {
      values.push(Number(query.minEmployees));
      whereExps.push(`num_employees >= $${values.length}`);
    }

    if (query.maxEmployees) {
      values.push(Number(query.maxEmployees));
      whereExps.push(`num_employees <= $${values.length}`);
    }

    if (whereExps.length === 0) {
      return "";
    }

    return {
      whereClause: 'WHERE ' + (whereExps.join(' AND ')),
      values: values
    };
  }

  /** Find all companies.
   *
   * Returns [{ handle, name, description, numEmployees, logoUrl }, ...]
   * */

  static async findAll(query) {
    if (query === undefined) {
      const companiesRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ORDER BY name`);
      return companiesRes.rows;
    }

    const { whereClause, values } = Company._makeWhereClause(query);

    const baseQuery = `
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        ${whereClause}
        ORDER BY name`;

    const companiesRes = await db.query(baseQuery, values);
    if (companiesRes.rows.length === 0) throw new NotFoundError("Company not found");

    return companiesRes.rows;

  }

  /** Given a company handle, return data about company.
   *
   * Returns { handle, name, description, numEmployees, logoUrl, jobs }
   *   where jobs is [{ id, title, salary, equity, companyHandle }, ...]
   *
   * Throws NotFoundError if not found.
   **/

  static async get(handle) {
    const companyRes = await db.query(`
        SELECT handle,
               name,
               description,
               num_employees AS "numEmployees",
               logo_url      AS "logoUrl"
        FROM companies
        WHERE handle = $1`, [handle]);

    const company = companyRes.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Update company data with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: {name, description, numEmployees, logoUrl}
   *
   * Returns {handle, name, description, numEmployees, logoUrl}
   *
   * Throws NotFoundError if not found.
   */

  static async update(handle, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        numEmployees: "num_employees",
        logoUrl: "logo_url",
      });
    const handleVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE companies
        SET ${setCols}
        WHERE handle = ${handleVarIdx}
        RETURNING
            handle,
            name,
            description,
            num_employees AS "numEmployees",
            logo_url AS "logoUrl"`;
    const result = await db.query(querySql, [...values, handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);

    return company;
  }

  /** Delete given company from database; returns undefined.
   *
   * Throws NotFoundError if company not found.
   **/

  static async remove(handle) {
    const result = await db.query(`
        DELETE
        FROM companies
        WHERE handle = $1
        RETURNING handle`, [handle]);
    const company = result.rows[0];

    if (!company) throw new NotFoundError(`No company: ${handle}`);
  }
}


module.exports = Company;
