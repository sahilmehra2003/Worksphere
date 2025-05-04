import Employee from "../models/employeeSchema.js";
import Department from "../models/departmentSchema.js";
import ProjectTeam from "../models/projectTeamSchema.js";
import Project from "../models/projectSchema.js";
import Client from "../models/clientSchema.js";
import Transaction from "../models/transactionSchema.js";
import EmployeePerformance from "../models/employeePerformanceSchema.js";
import data from "./data.js";
import User from "../models/userSchema.js";
const insertData = async () => {
  try {
    // Insert employee data
    for (const employee of data.employees) {
      await Employee.updateOne(
        { email: employee.email }, // Match condition (unique field, e.g., email)
        { $set: employee }, // Data to upsert
        { upsert: true } // Insert if not exists
      );
    }
    // console.log("Employee data inserted or updated");

    // Insert client data
    for (const client of data.client) {
      await Client.updateOne(
        { name: client.name }, // Match condition
        { $set: client },
        { upsert: true }
      );
    }
    // console.log("Client data inserted or updated");

    // Insert project data
    for (const project of data.projects) {
      await Project.updateOne(
        { name: project.name }, // Match condition
        { $set: project },
        { upsert: true }
      );
    }
    // console.log("Project data inserted or updated");

    // Insert project team data
    for (const projectTeam of data.projectTeams) {
      await ProjectTeam.updateOne(
        { teamName: projectTeam.teamName }, // Match condition
        { $set: projectTeam },
        { upsert: true }
      );
    }
    // console.log("Project team data inserted or updated");

    // Insert transaction data
    for (const transaction of data.transactions) {
      await Transaction.updateOne(
        { month: transaction.month }, // Match condition (unique identifier)
        { $set: transaction },
        { upsert: true }
      );
    }
    // console.log("Transaction data inserted or updated");

    // Insert department data
    for (const department of data.departments) {
      await Department.updateOne(
        { name: department.name }, // Match condition
        { $set: department },
        { upsert: true }
      );
    }
    // console.log("Department data inserted or updated");

    // Insert employee performance data
    for (const performance of data.employeePerformance) {
      await EmployeePerformance.updateOne(
        { employeeId: performance.employeeId }, // Match condition (unique identifier)
        { $set: performance },
        { upsert: true }
      );
    }
    // console.log("Employee performance data inserted or updated");

    // Insert user data
    for (const user of data.users) {
      await User.updateOne(
        { email: user.email }, // Match condition (unique field, e.g., email)
        { $set: user }, // Data to upsert
        { upsert: true } // Insert if not exists
      );
    }
    console.log("User data inserted or updated");

  } catch (error) {
    console.error("Error inserting data:", error);
  }
};


export default insertData;
