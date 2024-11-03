import { randomUUID } from "crypto";
import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnums = pgEnum("role", ["ADMIN", "USER"]);

export const usersTable = pgTable(
  "users",
  {
    id: text().primaryKey().$defaultFn(randomUUID),

    // firstName: varchar("first_name", { length: 255 }),
    // lastName: varchar("last_name", { length: 255 }),

    username: varchar({ length: 255 }),
    avatar: text(),

    email: varchar({ length: 255 }).unique(),
    emailVerified: boolean().default(false).notNull(),

    hashedPassword: varchar({ length: 256 }),

    role: roleEnums().default("USER").notNull(),

    createdAt: timestamp({ mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp({ mode: "date" }).$onUpdate(() => new Date()),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
  }),
);

export const accountsTable = pgTable("accounts", {
  id: text().primaryKey().$defaultFn(randomUUID),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text().notNull(), // google, github
  providerUserId: text().notNull(),
  accessToken: text().notNull(),
  refreshToken: text(),
  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
  }),
});

export const emailVerificationsTable = pgTable("email_verifications", {
  id: text().primaryKey().$defaultFn(randomUUID),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text().notNull(),
  code: text().notNull(),
  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text().primaryKey(),

  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  ip: text().notNull(),

  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
  }).notNull(),

  createdAt: timestamp({ withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
});

export const passwordResetSessionsTable = pgTable("password_reset_sessions", {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text().notNull(),
  emailVerified: boolean().notNull().default(false),
  code: text().notNull(),
  expiresAt: timestamp({
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

// CREATE TABLE password_reset_session (
//   id TEXT NOT NULL PRIMARY KEY,
//   user_id INTEGER NOT NULL REFERENCES user(id),
//   email TEXT NOT NULL,
//   code TEXT NOT NULL,
//   expires_at INTEGER NOT NULL,
//   email_verified INTEGER NOT NULL NOT NULL DEFAULT 0,
//   two_factor_verified INTEGER NOT NULL DEFAULT 0
// );

export type User = InferSelectModel<typeof usersTable>;
export type Account = InferSelectModel<typeof accountsTable>;
export type Session = InferSelectModel<typeof sessionsTable>;
export type EmailVerification = InferSelectModel<
  typeof emailVerificationsTable
>;
export type PasswordResetSession = InferSelectModel<
  typeof passwordResetSessionsTable
>;
