import { randomUUID } from "crypto";
import { InferSelectModel } from "drizzle-orm";
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  // uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const roleEnums = pgEnum("role", ["ADMIN", "USER"]);

export const usersTable = pgTable(
  "users",
  {
    id: text("id").primaryKey().$defaultFn(randomUUID),

    // firstName: varchar("first_name", { length: 255 }),
    // lastName: varchar("last_name", { length: 255 }),

    username: varchar("username", { length: 255 }),
    avatar: text("avatar"),

    email: varchar("email", { length: 255 }).unique(),
    emailVerified: boolean("email_verified").default(false).notNull(),

    hashedPassword: varchar("hashed_password", { length: 255 }),

    role: roleEnums("role").default("USER").notNull(),

    createdAt: timestamp("createdAt", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updatedAt", { mode: "date" }).$onUpdate(
      () => new Date(),
    ),
  },
  (table) => ({
    emailIdx: index("user_email_idx").on(table.email),
  }),
);

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(), // google, github
  providerUserId: text("provider_user_id").notNull(),
  accessToken: text("access_token").notNull(),
  refreshToken: text("refresh_token"),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }),
});

export const emailVerificationsTable = pgTable("email_verifications", {
  id: text("id").primaryKey().$defaultFn(randomUUID),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  code: text("code").notNull(),
  sentAt: timestamp("sent_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", {
    withTimezone: true,
    mode: "date",
  }).notNull(),
});

export const passwordResetSessionsTable = pgTable("password_reset_sessions", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  emailVerified: boolean("email_verified").notNull().default(false),
  code: text("code").notNull(),
  expiresAt: timestamp("expires_at", {
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
export type Session = InferSelectModel<typeof sessionsTable>;
export type PasswordResetSession = InferSelectModel<
  typeof passwordResetSessionsTable
>;
