import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { sql } from "drizzle-orm";
import * as schema from "../src/models/schema";
import { db, poolConnection } from "../src/config/db";
import bcrypt from "bcrypt";
import dotenv from "dotenv";

dotenv.config();

async function seed(): Promise<void> {
  try {


    const languages = [
      { "id": 45, "name": "Assembly (NASM 2.14.02)" }, { "id": 46, "name": "Bash (5.0.0)" }, { "id": 47, "name": "Basic (FBC 1.07.1)" },
      { "id": 75, "name": "C (Clang 7.0.1)" }, { "id": 76, "name": "C++ (Clang 7.0.1)" }, { "id": 48, "name": "C (GCC 7.4.0)" },
      { "id": 52, "name": "C++ (GCC 7.4.0)" }, { "id": 49, "name": "C (GCC 8.3.0)" }, { "id": 53, "name": "C++ (GCC 8.3.0)" },
      { "id": 50, "name": "C (GCC 9.2.0)" }, { "id": 54, "name": "C++ (GCC 9.2.0)" }, { "id": 86, "name": "Clojure (1.10.1)" },
      { "id": 51, "name": "C# (Mono 6.6.0.161)" }, { "id": 77, "name": "COBOL (GnuCOBOL 2.2)" }, { "id": 55, "name": "Common Lisp (SBCL 2.0.0)" },
      { "id": 90, "name": "Dart (2.19.2)" }, { "id": 56, "name": "D (DMD 2.089.1)" }, { "id": 57, "name": "Elixir (1.9.4)" },
      { "id": 58, "name": "Erlang (OTP 22.2)" }, { "id": 44, "name": "Executable" }, { "id": 87, "name": "F# (.NET Core SDK 3.1.202)" },
      { "id": 59, "name": "Fortran (GFortran 9.2.0)" }, { "id": 60, "name": "Go (1.13.5)" }, { "id": 95, "name": "Go (1.18.5)" },
      { "id": 88, "name": "Groovy (3.0.3)" }, { "id": 61, "name": "Haskell (GHC 8.8.1)" }, { "id": 96, "name": "JavaFX (JDK 17.0.6, OpenJFX 22.0.2)" },
      { "id": 91, "name": "Java (JDK 17.0.6)" }, { "id": 62, "name": "Java (OpenJDK 13.0.1)" }, { "id": 63, "name": "JavaScript (Node.js 12.14.0)" },
      { "id": 93, "name": "JavaScript (Node.js 18.15.0)" }, { "id": 78, "name": "Kotlin (1.3.70)" }, { "id": 64, "name": "Lua (5.3.5)" },
      { "id": 89, "name": "Multi-file program" }, { "id": 79, "name": "Objective-C (Clang 7.0.1)" }, { "id": 65, "name": "OCaml (4.09.0)" },
      { "id": 66, "name": "Octave (5.1.0)" }, { "id": 67, "name": "Pascal (FPC 3.0.4)" }, { "id": 85, "name": "Perl (5.28.1)" },
      { "id": 68, "name": "PHP (7.4.1)" }, { "id": 43, "name": "Plain Text" }, { "id": 69, "name": "Prolog (GNU Prolog 1.4.5)" },
      { "id": 70, "name": "Python (2.7.17)" }, { "id": 92, "name": "Python (3.11.2)" }, { "id": 71, "name": "Python (3.8.1)" },
      { "id": 80, "name": "R (4.0.0)" }, { "id": 72, "name": "Ruby (2.7.0)" }, { "id": 73, "name": "Rust (1.40.0)" },
      { "id": 81, "name": "Scala (2.13.2)" }, { "id": 82, "name": "SQL (SQLite 3.27.2)" }, { "id": 83, "name": "Swift (5.2.3)" },
      { "id": 74, "name": "TypeScript (3.7.4)" }, { "id": 94, "name": "TypeScript (5.0.3)" }, { "id": 84, "name": "Visual Basic.Net (vbnc 0.0.0.5943)" }
    ];

    for (const lang of languages) {
      await db.insert(schema.programming_language).values({
        programming_language_id: lang.id,
        language_name: lang.name
      });
    }


    // Helper function to hash passwords
    const hashPassword = async (password: string): Promise<string> => {
      return await bcrypt.hash(password, 10);
    };

    // Seed departments table
    const departments: Array<{ name: string }> = [
      { name: "Computer Science" },
      { name: "Information Technology" },
      { name: "Artificial Intelligence and Data Science" },
    ];

    for (const department of departments) {
      await db.insert(schema.departments).values(department);
    }

    console.log("Departments seeded successfully");

    // Fetch inserted departments
    const insertedDepartments = await db.select().from(schema.departments);

    // Seed users table with 1 Admin and 1 HOD for each department
    interface UserInsert {
      username: string;
      password: string;
      email: string;
      role: "Admin" | "HOD" | "Faculty" | "Student";
    }

    const adminInserts: UserInsert[] = [];
    const hodInserts: UserInsert[] = [];
    const facultyInserts: UserInsert[] = [];

    for (const dept of insertedDepartments) {
      const admin: UserInsert = {
        username: `admin_${dept.name.replace(/\s+/g, "_").toLowerCase()}`,
        password: await hashPassword("123456"),
        email: `admin_${dept.name.toLowerCase()}@example.com`,
        role: "Admin",
      };
      const hod: UserInsert = {
        username: `hod_${dept.name.replace(/\s+/g, "_").toLowerCase()}`,
        password: await hashPassword("123456"),
        email: `hod_${dept.name.toLowerCase()}@example.com`,
        role: "HOD",
      };
      adminInserts.push(admin);
      hodInserts.push(hod);

      // Insert 5 Faculty members for each department
      for (let i = 1; i <= 5; i++) {
        facultyInserts.push({
          username: `${dept.name
            .replace(/\s+/g, "_")
            .toLowerCase()}_faculty${i}`,
          password: await hashPassword(`123456`),
          email: `${dept.name.toLowerCase()}_faculty${i}@example.com`,
          role: "Faculty",
        });
      }
    }

    // Insert Admins, HODs, and Faculty
    await db
      .insert(schema.users)
      .values([...adminInserts, ...hodInserts, ...facultyInserts]);

    console.log("Admins, HODs, and Faculty seeded successfully");

    // Fetch inserted users (Admins, HODs, Faculty)
    const insertedUsers = await db.select().from(schema.users);

    // Map departments to their respective HODs and Faculty
    const deptToHODMap: Record<number, number> = {};
    const deptToFacultyMap: Record<number, number[]> = {};

    insertedDepartments.forEach((dept, index) => {
      deptToHODMap[dept.department_id] =
        insertedUsers[adminInserts.length + index].user_id;
      deptToFacultyMap[dept.department_id] = insertedUsers
        .filter((user) => user.role === "Faculty")
        .slice(index * 5, (index + 1) * 5)
        .map((faculty) => faculty.user_id);
    });

    // Seed batch table with 8 semesters, 2 divisions per semester, 4 batches per division
    interface BatchInsert {
      department_id: number;
      semester: number;
      division: string;
      batch: string;
    }

    const batchInserts: BatchInsert[] = [];

    for (const dept of insertedDepartments) {
      for (let semester = 1; semester <= 8; semester++) {
        for (const division of ["A", "B"]) {
          for (let batch = 1; batch <= 4; batch++) {
            batchInserts.push({
              department_id: dept.department_id,
              semester: semester,
              division: division,
              batch: batch.toString(),
            });
          }
        }
      }
    }

    await db.insert(schema.batch).values(batchInserts);

    console.log("Batches seeded successfully");

    // Fetch inserted batches
    const insertedBatches = await db.select().from(schema.batch);

    // Seed students table with 5 students per batch
    interface StudentInsert {
      student_id: number;
      batch_id: number;
      roll_id: string;
    }

    const studentInserts: StudentInsert[] = [];

    for (const batch of insertedBatches) {
      for (let i = 1; i <= 5; i++) {
        const studentUsername = `student_${batch.department_id}_${batch.semester}_${batch.division}_${batch.batch}_${i}`;
        const studentEmail = `${studentUsername}@example.com`;
        const student: UserInsert = {
          username: studentUsername,
          password: await hashPassword("123456"),
          email: studentEmail,
          role: "Student",
        };
        await db.insert(schema.users).values(student);

        // Fetch the inserted student ID
        const insertedStudent = await db
          .select({ user_id: schema.users.user_id })
          .from(schema.users)
          .where(sql`username = ${studentUsername}`)
          .limit(1);

        studentInserts.push({
          student_id: insertedStudent[0].user_id,
          batch_id: batch.batch_id,
          roll_id: `ROLL${batch.semester}${batch.division}${batch.batch}${i}`,
        });
      }
    }

    await db.insert(schema.students).values(studentInserts);

    console.log("Students seeded successfully");

    // Seed courses table with 2-3 courses per semester in each department
    interface CourseInsert {
      course_name: string;
      course_code: string;
      semester: number;
      department_id: number;
    }

    const courseInserts: CourseInsert[] = [];
    const courseNames = [
      "Data Structures",
      "Database Management",
      "Operating Systems",
      "Artificial Intelligence",
      "Machine Learning",
    ];

    for (const dept of insertedDepartments) {
      for (let semester = 1; semester <= 8; semester++) {
        for (let i = 0; i < 2 + Math.floor(Math.random() * 2); i++) {
          courseInserts.push({
            course_name: `${courseNames[i % courseNames.length]
              } Sem ${semester}`,
            course_code: `${dept.name.charAt(0).toUpperCase()}S${semester}C${i + 1
              }`,
            semester: semester,
            department_id: dept.department_id,
          });
        }
      }
    }

    await db.insert(schema.courses).values(courseInserts);

    console.log("Courses seeded successfully");

    // Fetch inserted courses
    const insertedCourses = await db.select().from(schema.courses);

    // Seed courses_faculty table with courses linked to faculty and batches
    interface CoursesFacultyInsert {
      course_id: number;
      faculty_id: number;
      batch_id: number;
    }

    const coursesFacultyInserts: CoursesFacultyInsert[] = [];

    for (const course of insertedCourses) {
      const departmentFaculties = deptToFacultyMap[course.department_id];
      const faculty =
        departmentFaculties[
        Math.floor(Math.random() * departmentFaculties.length)
        ];
      const batches = insertedBatches.filter(
        (batch) =>
          batch.department_id === course.department_id &&
          batch.semester === course.semester
      );

      for (const batch of batches) {
        coursesFacultyInserts.push({
          course_id: course.course_id,
          faculty_id: faculty,
          batch_id: batch.batch_id,
        });
      }
    }

    await db.insert(schema.courses_faculty).values(coursesFacultyInserts);

    console.log("Courses-Faculty-Batch associations seeded successfully");
  } catch (error) {
    console.error("Error seeding data:", error);
  } finally {
    await poolConnection.end();
  }
}

seed();
