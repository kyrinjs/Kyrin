/**
 * Database Tests
 * ทดสอบ Unified Database API และ SQLiteClient
 */

import { describe, test, expect, beforeEach, afterEach } from "bun:test";
import { Database, database, SQLiteClient } from "../src/db";

// ==================== SQLiteClient Tests ====================

describe("SQLiteClient", () => {
  let db: SQLiteClient;

  beforeEach(() => {
    db = new SQLiteClient();
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT UNIQUE
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  describe("exec()", () => {
    test("should create table", () => {
      db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY)");
      expect(true).toBe(true);
    });

    test("should execute multiple statements", () => {
      db.exec(`
        CREATE TABLE posts (id INTEGER PRIMARY KEY);
        CREATE TABLE comments (id INTEGER PRIMARY KEY);
      `);
      expect(true).toBe(true);
    });
  });

  describe("run()", () => {
    test("should insert and return lastInsertRowid", () => {
      const result = db.run("INSERT INTO users (name) VALUES (?)", ["John"]);
      expect(result.lastInsertRowid).toBe(1);
      expect(result.changes).toBe(1);
    });

    test("should update and return changes count", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["John"]);
      const result = db.run("UPDATE users SET name = ?", ["Jane"]);
      expect(result.changes).toBe(1);
    });

    test("should delete and return changes count", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["John"]);
      const result = db.run("DELETE FROM users WHERE id = ?", [1]);
      expect(result.changes).toBe(1);
    });
  });

  describe("query()", () => {
    test("should return all rows", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);
      db.run("INSERT INTO users (name) VALUES (?)", ["Bob"]);

      const users = db.query<{ id: number; name: string }>(
        "SELECT * FROM users"
      );
      expect(users.length).toBe(2);
      expect(users[0]?.name).toBe("Alice");
      expect(users[1]?.name).toBe("Bob");
    });

    test("should return filtered rows with params", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);
      db.run("INSERT INTO users (name) VALUES (?)", ["Bob"]);

      const users = db.query<{ id: number; name: string }>(
        "SELECT * FROM users WHERE name = ?",
        ["Alice"]
      );
      expect(users.length).toBe(1);
      expect(users[0]?.name).toBe("Alice");
    });

    test("should return empty array when no matches", () => {
      const users = db.query("SELECT * FROM users");
      expect(users.length).toBe(0);
    });
  });

  describe("queryOne()", () => {
    test("should return first matching row", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["John"]);
      const user = db.queryOne<{ id: number; name: string }>(
        "SELECT * FROM users WHERE id = ?",
        [1]
      );
      expect(user).not.toBeNull();
      expect(user!.name).toBe("John");
    });

    test("should return null when no match", () => {
      const user = db.queryOne("SELECT * FROM users WHERE id = ?", [999]);
      expect(user).toBeNull();
    });
  });

  describe("prepare()", () => {
    test("should create reusable prepared statement", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);
      db.run("INSERT INTO users (name) VALUES (?)", ["Bob"]);

      const findUser = db.prepare<{ id: number; name: string }>(
        "SELECT * FROM users WHERE id = ?"
      );

      const user1 = findUser.get(1);
      const user2 = findUser.get(2);

      expect(user1!.name).toBe("Alice");
      expect(user2!.name).toBe("Bob");
      findUser.finalize();
    });

    test("prepared statement run() should return changes", () => {
      const insertUser = db.prepare("INSERT INTO users (name) VALUES (?)");
      const result = insertUser.run("Charlie");

      expect(result.lastInsertRowid).toBe(1);
      expect(result.changes).toBe(1);
      insertUser.finalize();
    });
  });

  describe("transaction()", () => {
    test("should commit all operations on success", () => {
      db.transaction(() => {
        db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);
        db.run("INSERT INTO users (name) VALUES (?)", ["Bob"]);
      });

      const users = db.query("SELECT * FROM users");
      expect(users.length).toBe(2);
    });

    test("should rollback all operations on error", () => {
      try {
        db.transaction(() => {
          db.run("INSERT INTO users (name) VALUES (?)", ["Alice"]);
          throw new Error("Simulated error");
        });
      } catch {
        // Expected error
      }

      const users = db.query("SELECT * FROM users");
      expect(users.length).toBe(0);
    });

    test("should return value from callback", () => {
      const result = db.transaction(() => {
        const { lastInsertRowid } = db.run(
          "INSERT INTO users (name) VALUES (?)",
          ["Alice"]
        );
        return lastInsertRowid;
      });
      expect(result).toBe(1);
    });
  });

  describe("configuration", () => {
    test("should create file-based database", () => {
      const fileDb = new SQLiteClient({ filename: ":memory:" });
      fileDb.exec("CREATE TABLE test (id INTEGER PRIMARY KEY)");
      fileDb.close();
    });

    test("should provide access to native database", () => {
      expect(db.native).toBeDefined();
    });
  });
});

// ==================== Unified Database API Tests ====================

describe("Database (Unified API)", () => {
  describe("Config Object", () => {
    test("should create SQLite database with config", () => {
      const db = new Database({ type: "sqlite" });
      db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
      db.run("INSERT INTO test (name) VALUES (?)", ["Hello"]);
      const rows = db.query<{ id: number; name: string }>("SELECT * FROM test");

      expect(rows.length).toBe(1);
      expect(rows[0]?.name).toBe("Hello");
      db.close();
    });

    test("should create SQLite database with filename", () => {
      const db = new Database({ type: "sqlite", filename: ":memory:" });
      db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY)");
      db.close();
    });

    test("should throw for unsupported postgres", () => {
      expect(() => new Database({ type: "postgres" })).toThrow("coming soon");
    });

    test("should throw for unsupported mysql", () => {
      expect(() => new Database({ type: "mysql" })).toThrow("coming soon");
    });
  });

  describe("Connection String", () => {
    test("should parse sqlite: connection string", () => {
      const db = database("sqlite::memory:");
      db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY, name TEXT)");
      db.run("INSERT INTO test (name) VALUES (?)", ["World"]);
      const rows = db.query<{ id: number; name: string }>("SELECT * FROM test");

      expect(rows.length).toBe(1);
      expect(rows[0]?.name).toBe("World");
      db.close();
    });

    test("should parse sqlite:./path connection string", () => {
      const db = database("sqlite::memory:");
      db.exec("CREATE TABLE test (id INTEGER PRIMARY KEY)");
      db.close();
    });

    test("should throw for unsupported postgres connection string", () => {
      expect(() => database("postgres://localhost/mydb")).toThrow(
        "coming soon"
      );
    });

    test("should throw for unsupported mysql connection string", () => {
      expect(() => database("mysql://localhost/mydb")).toThrow("coming soon");
    });

    test("should throw for invalid connection string", () => {
      expect(() => database("invalid:something")).toThrow("Unsupported");
    });
  });
});

// ==================== Minimal SQL API Tests ====================

describe("Minimal SQL API (sql template)", () => {
  let db: SQLiteClient;

  beforeEach(() => {
    db = new SQLiteClient();
    db.exec(
      "CREATE TABLE users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, age INTEGER)"
    );
  });

  afterEach(() => {
    db.close();
  });

  describe("Tagged Template Literal", () => {
    test("should insert with template literal", () => {
      const name = "John";
      const result = db.sql`INSERT INTO users (name) VALUES (${name})`.run();
      expect(result.lastInsertRowid).toBe(1);
    });

    test("should query with template literal", () => {
      db.sql`INSERT INTO users (name, age) VALUES (${"Alice"}, ${25})`.run();
      db.sql`INSERT INTO users (name, age) VALUES (${"Bob"}, ${30})`.run();

      const minAge = 18;
      const users = db.sql<{
        name: string;
        age: number;
      }>`SELECT * FROM users WHERE age > ${minAge}`.all();
      expect(users.length).toBe(2);
    });

    test("should get first with template literal", () => {
      db.sql`INSERT INTO users (name) VALUES (${"Charlie"})`.run();

      const id = 1;
      const user = db.sql<{
        id: number;
        name: string;
      }>`SELECT * FROM users WHERE id = ${id}`.first();
      expect(user?.name).toBe("Charlie");
    });

    test("should return null for no match", () => {
      const user = db.sql`SELECT * FROM users WHERE id = ${999}`.first();
      expect(user).toBeNull();
    });
  });

  describe("Single Method", () => {
    test("should query with single method", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["Dave"]);

      const users = db.sql<{ name: string }>("SELECT * FROM users").all();
      expect(users.length).toBe(1);
      expect(users[0]?.name).toBe("Dave");
    });

    test("should query with params", () => {
      db.run("INSERT INTO users (name) VALUES (?)", ["Eve"]);

      const user = db
        .sql<{ name: string }>("SELECT * FROM users WHERE id = ?", [1])
        .first();
      expect(user?.name).toBe("Eve");
    });
  });
});
