import mongoose from "mongoose";
const data = {
     employees:[
        {
          _id:new mongoose.Types.ObjectId("64f7a3cd0e8f1c1a8e7b4d26"),
          name: "Alice Johnson",
          email: "alice.johnson@gmail.com",
          phoneNumber: "1234567890",
          city: "New York",
          state: "NY",
          country: "USA",
          department: "Management",
          position: "Team Lead",
          teamName: "Innovators",
          workUnder: "Tech Solutions Ltd.",
          role: "Admin",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3ce0e8f1c1a8e7b4d27") ,
          name: "Bob Smith",
          email: "bob.smith@gmail.com",
          phoneNumber: "9876543210",
          city: "San Francisco",
          state: "CA",
          country: "USA",
          department: "Development",
          position: "Developer",
          teamName: "Innovators",
          workUnder: "Tech Solutions Ltd.",
          role: "Admin",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3cf0e8f1c1a8e7b4d28") ,
          name: "Charlie Brown",
          email: "charlie.brown@gmail.com",
          phoneNumber: "1234509876",
          city: "Los Angeles",
          state: "CA",
          country: "USA",
          department: "Marketing",
          position: "Marketing Head",
          teamName: "Marketing Masters",
          workUnder: "Tech Solutions Ltd.",
          role: "Admin",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d00e8f1c1a8e7b4d29") ,
          name: "Diana Green",
          email: "diana.green@gmail.com",
          phoneNumber: "2345678901",
          city: "San Diego",
          state: "CA",
          country: "USA",
          department: "Marketing",
          position: "Marketing Specialist",
          teamName: "Marketing Masters",
          workUnder: "Tech Solutions Ltd.",
          role: "Admin",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d10e8f1c1a8e7b4d2a") ,
          name: "Eva White",
          email: "eva.white@gmail.com",
          phoneNumber: "3456789012",
          city: "Chicago",
          state: "IL",
          country: "USA",
          department: "Customer Support",
          position: "Support Executive Manager",
          teamName: "Support Champs",
          workUnder: "Tech Solutions Ltd.",
          role: "Admin",
          status: "Inactive"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d20e8f1c1a8e7b4d2b"),
          name: "Frank Harris",
          email: "frank.harris@gmail.com",
          phoneNumber: "4567890123",
          city: "Houston",
          state: "TX",
          country: "USA",
          department: "Development",
          position: "Senior Developer",
          teamName: "Innovators",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d30e8f1c1a8e7b4d2c"),
          name: "Grace Lee",
          email: "grace.lee@gmail.com",
          phoneNumber: "5678901234",
          city: "Austin",
          state: "TX",
          country: "USA",
          department: "Development",
          position: "Prodduct Analyst",
          teamName: "FutureTech",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id:new mongoose.Types.ObjectId("64f7a3d40e8f1c1a8e7b4d2d"),
          name: "Harry King",
          email: "harry.king@gmail.com",
          phoneNumber: "6789012345",
          city: "Seattle",
          state: "WA",
          country: "USA",
          department: "Development",
          position: "Project Manager",
          teamName: "TechPioneers",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId( "64f7a3d50e8f1c1a8e7b4d2e"),
          name: "Ivy Thomas",
          email: "ivy.thomas@gmail.com",
          phoneNumber: "7890123456",
          city: "Boston",
          state: "MA",
          country: "USA",
          department: "Development",
          position: "Frontend Developer",
          teamName: "Tech Wizards",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId( "64f7a3d60e8f1c1a8e7b4d2f"),
          name: "Jack White",
          email: "jack.white@gmail.com",
          phoneNumber: "8901234567",
          city: "Denver",
          state: "CO",
          country: "USA",
          department: "Development",
          position: "Software Engineer",
          teamName: "FutureTech",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d70e8f1c1a8e7b4d30") ,
          name: "Kathy Black",
          email: "kathy.black@gmail.com",
          phoneNumber: "9012345678",
          city: "Miami",
          state: "FL",
          country: "USA",
          department: "Marketing",
          position: "Social Media Manager",
          teamName: "Marketing Masters",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3d80e8f1c1a8e7b4d31") ,
          name: "Liam Scott",
          email: "liam.scott@gmail.com",
          phoneNumber: "0123456789",
          city: "Phoenix",
          state: "AZ",
          country: "USA",
          department: "Customer Support",
          position: "Support Specialist",
          teamName: "Support Champs",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId( "64f7a3d90e8f1c1a8e7b4d32"),
          name: "Mona Collins",
          email: "mona.collins@gmail.com",
          phoneNumber: "1239876540",
          city: "Dallas",
          state: "TX",
          country: "USA",
          department: "Sales",
          position: "Sales Analyst",
          teamName: "Sales Gurus",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3da0e8f1c1a8e7b4d33"),
          name: "Nina Carter",
          email: "nina.carter@gmail.com",
          phoneNumber: "2348765432",
          city: "San Antonio",
          state: "TX",
          country: "USA",
          department: "Development",
          position: "Backend Developer",
          teamName: "Tech Wizards",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id: new mongoose.Types.ObjectId("64f7a3db0e8f1c1a8e7b4d34"),
          name: "Oscar Clark",
          email: "oscar.clark@gmail.com",
          phoneNumber: "3457654321",
          city: "Chicago",
          state: "IL",
          country: "USA",
          department: "Marketing",
          position: "SEO Specialist",
          teamName: "Marketing Pros",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
          _id:new mongoose.Types.ObjectId("64f7a3dc0e8f1c1a8e7b4d35") ,
          name: "Paula Adams",
          email: "paula.adams@gmail.com",
          phoneNumber: "4566543210",
          city: "Orlando",
          state: "FL",
          country: "USA",
          department: "Development",
          position: "App Developer",
          teamName: "CodeSmiths",
          workUnder: "Tech Solutions Ltd.",
          role: "Employee",
          status: "Active"
        },
        {
            _id: new mongoose.Types.ObjectId( "64f7a3dd0e8f1c1a8e7b4d36"),
            name: "Quincy Evans",
            email: "quincy.evans@gmail.com",
            phoneNumber: "5675432109",
            city: "Las Vegas",
            state: "NV",
            country: "USA",
            department: "Development",
            position: "UI/UX Designer",
            teamName: "Digital Masters",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id: new mongoose.Types.ObjectId("64f7a3de0e8f1c1a8e7b4d37") ,
            name: "Rachel Lee",
            email: "rachel.lee@gmail.com",
            phoneNumber: "6784321098",
            city: "Dallas",
            state: "TX",
            country: "USA",
            department: "Development",
            position: "DevOps Engineer",
            teamName: "Tech Wizards",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id: new mongoose.Types.ObjectId("64f7a3df0e8f1c1a8e7b4d38"),
            name: "Steve Miller",
            email: "steve.miller@gmail.com",
            phoneNumber: "7893210987",
            city: "Phoenix",
            state: "AZ",
            country: "USA",
            department: "Development",
            position: "Web Developer",
            teamName: "TechPioneers",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id: new mongoose.Types.ObjectId("64f7a3e00e8f1c1a8e7b4d39") ,
            name: "Tina Young",
            email: "tina.young@gmail.com",
            phoneNumber: "8902109876",
            city: "Austin",
            state: "TX",
            country: "USA",
            department: "Marketing",
            position: "Content Strategist",
            teamName: "Digital Masters",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id: new mongoose.Types.ObjectId("64f7a3e10e8f1c1a8e7b4d3a") ,
            name: "Uma Patel",
            email: "uma.patel@gmail.com",
            phoneNumber: "9011098765",
            city: "San Diego",
            state: "CA",
            country: "USA",
            department: "Development",
            position: "Software Developer",
            teamName: "Innovators 2.0",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id:new mongoose.Types.ObjectId("64f7a3e20e8f1c1a8e7b4d3b"),
            name: "Victor Harris",
            email: "victor.harris@gmail.com",
            phoneNumber: "0122109876",
            city: "New York",
            state: "NY",
            country: "USA",
            department: "Sales",
            position: "Account Executive",
            teamName: "Sales Gurus",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id: new mongoose.Types.ObjectId("64f7a3e30e8f1c1a8e7b4d3c") ,
            name: "Wendy Clark",
            email: "wendy.clark@gmail.com",
            phoneNumber: "1232109876",
            city: "Los Angeles",
            state: "CA",
            country: "USA",
            department: "Development",
            position: "Full Stack Developer",
            teamName: "Tech Visionaries",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id:new mongoose.Types.ObjectId("64f7a3e40e8f1c1a8e7b4d3d"),
            name: "Xander Allen",
            email: "xander.allen@gmail.com",
            phoneNumber: "2343210987",
            city: "Chicago",
            state: "IL",
            country: "USA",
            department: "Development",
            position: "Software Head",
            teamName: "Tech Wizards",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          },
          {
            _id:new mongoose.Types.ObjectId("64f7a3e50e8f1c1a8e7b4d3e") ,
            name: "Yasmine Roberts",
            email: "yasmine.roberts@gmail.com",
            phoneNumber: "3454321098",
            city: "Miami",
            state: "FL",
            country: "USA",
            department: "Development",
            position: "Product Developer",
            teamName: "CodeSmiths",
            workUnder: "Tech Solutions Ltd.",
            role: "Employee",
            status: "Active"
          }
    ],
    
     projects : [
        {
          projectId:new mongoose.Types.ObjectId( "64e7b9c50e8f1c1a8f7a3c9b")
          ,
          name: "Website Redesign",
          description: "Redesigning the corporate website for Tech Solutions Ltd.",
          clientId:new mongoose.Types.ObjectId("64e7f8c10e8f1c1a8f7a3c9e") ,
          status: "In Progress",
          startDate: "2024-01-10",
          endDate: "2024-03-15",
          teamId:new mongoose.Types.ObjectId("64f7a3c10e8f1c1a8e7b4d1a") ,
          budget: 20000,
          expenses: 15000,
          revenue: 25000,
          projectStatus: "Running"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9c60e8f1c1a8f7a3c9c"),
          name: "Health App Development",
          description: "Developing a mobile app for HealthCare Inc.",
          clientId:new mongoose.Types.ObjectId("64e7f8c20e8f1c1a8f7a3c9f") ,
          status: "Completed",
          startDate: "2023-10-01",
          endDate: "2024-01-31",
          teamId: new mongoose.Types.ObjectId("64f7a3c20e8f1c1a8e7b4d1b"),
          budget: 30000,
          expenses: 25000,
          revenue: 35000,
          projectStatus: "Completed"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9c70e8f1c1a8f7a3c9d"),
          name: "CRM System for Retail",
          description: "Building a Customer Relationship Management system for RetailCorp.",
          clientId:null,
          status: "Not Assigned",
          startDate: "2024-04-01",
          endDate: "2024-08-28",
          teamId:null,
          budget: 25000,
          expenses: 0,
          revenue: 0,
          projectStatus: "Abandoned"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9c80e8f1c1a8f7a3c9e"),
          name: "Cloud Migration for FinTech",
          description: "Migrating the financial services infrastructure to the cloud for FinTech Group.",
          clientId: new mongoose.Types.ObjectId("64e7f8c30e8f1c1a8f7a3ca0"),
          status: "In Progress",
          startDate: "2024-02-01",
          endDate: "2024-07-01",
          teamId: new mongoose.Types.ObjectId("64f7a3c30e8f1c1a8e7b4d1c"),
          budget: 45000,
          expenses: 22000,
          revenue: 32000,
          projectStatus: "Running"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9c90e8f1c1a8f7a3c9f"),
          name: "E-commerce Platform Upgrade",
          description: "Upgrading the existing e-commerce platform for ShopSmart Inc.",
          clientId:null,
          status: "Abandoned",
          startDate: "2023-12-15",
          endDate: "2024-01-20",
          teamId:null,
          budget: 20000,
          expenses: 15000,
          revenue: 0,
          projectStatus: "Abandoned"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9ca0e8f1c1a8f7a3ca0"),
          name: "Employee Training System",
          description: "Developing an online training system for EmployeeSkills Ltd.",
          clientId: new mongoose.Types.ObjectId("64e7f8c40e8f1c1a8f7a3ca1"),
          status: "In Progress",
          startDate: "2024-03-10",
          endDate: "2024-06-30",
          teamId: new mongoose.Types.ObjectId("64f7a3c40e8f1c1a8e7b4d1d"),
          budget: 30000,
          expenses: 10000,
          revenue: 15000,
          projectStatus: "Running"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9cb0e8f1c1a8f7a3ca1"),
          name: "AI Chatbot for Customer Support",
          description: "Building an AI chatbot for customer support for SupportInc.",
          clientId: new mongoose.Types.ObjectId("64e7f8c80e8f1c1a8f7a3ca5"),
          status: "Not Assigned",
          startDate: "2024-05-01",
          endDate: "2024-06-20",
          teamId:null,
          budget: 35000,
          expenses: 0,
          revenue: 0,
          projectStatus: "Not Assigned"
        },
        {
          projectId:new mongoose.Types.ObjectId("64e7b9cc0e8f1c1a8f7a3ca2") ,
          name: "Data Analytics Dashboard",
          description: "Creating a data analytics dashboard for DataCorp.",
          clientId: new mongoose.Types.ObjectId("64e7f8c50e8f1c1a8f7a3ca2"),
          status: "In Progress",
          startDate: "2024-01-25",
          endDate: "2024-04-30",
          teamId: new mongoose.Types.ObjectId("64f7a3c50e8f1c1a8e7b4d1e"),
          budget: 40000,
          expenses: 17000,
          revenue: 26000,
          projectStatus: "Running"
        },
        {
          projectId:new mongoose.Types.ObjectId("64e7b9cd0e8f1c1a8f7a3ca3") ,
          name: "Mobile App for Sports Fanatics",
          description: "Developing a mobile app for SportsFanatics.",
          clientId: new mongoose.Types.ObjectId("64e7f8c60e8f1c1a8f7a3ca3"),
          status: "Completed",
          startDate: "2023-08-10",
          endDate: "2023-12-01",
          teamId: new mongoose.Types.ObjectId("64f7a3c60e8f1c1a8e7b4d1f"),
          budget: 25000,
          expenses: 22000,
          revenue: 30000,
          projectStatus: "Completed"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9ce0e8f1c1a8f7a3ca4"),
          name: "Enterprise Resource Planning System",
          description: "Building an ERP system for GlobalTech.",
          clientId: new mongoose.Types.ObjectId("64e7f8c70e8f1c1a8f7a3ca4"),
          status: "In Progress",
          startDate: "2024-02-15",
          endDate: "2024-09-15",
          teamId: new mongoose.Types.ObjectId("64f7a3c70e8f1c1a8e7b4d20"),
          budget: 60000,
          expenses: 35000,
          revenue: 50000,
          projectStatus: "Running"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9cf0e8f1c1a8f7a3ca5"),
          name: "Supply Chain Automation",
          description: "Implementing supply chain automation for ChainFlow.",
          clientId:null,
          status: "Not Assigned",
          startDate: "2024-04-01",
          endDate: "2024-07-15",
          teamId:null,
          budget: 55000,
          expenses: 0,
          revenue: 0,
          projectStatus: "Abandoned"
        },
        {
          projectId: new mongoose.Types.ObjectId("64e7b9d00e8f1c1a8f7a3ca6"),
          name: "Smart Home System Integration",
          description: "Integrating smart home technology for HomeTech.",
          clientId: new mongoose.Types.ObjectId("64e7f8c90e8f1c1a8f7a3ca6"),
          status: "In Progress",
          startDate: "2024-01-05",
          endDate: "2024-12-31",
          teamId: new mongoose.Types.ObjectId("64f7a3cc0e8f1c1a8e7b4d25"),
          budget: 70000,
          expenses: 25000,
          revenue: 42000,
          projectStatus: "Running"
        }
      ],
    projectTeams : [
        {
          teamId:new mongoose.Types.ObjectId("64f7a3c10e8f1c1a8e7b4d1a"),
          teamName: "Innovators",
          head: "Alice Johnson",
          projectId:new mongoose.Types.ObjectId("64e7b9c50e8f1c1a8f7a3c9b"),
          clientId:new mongoose.Types.ObjectId("64e7f8c10e8f1c1a8f7a3c9e"),
          members: [
            { employeeId: new mongoose.Types.ObjectId("64f7a3cd0e8f1c1a8e7b4d26"), name: "Alice Johnson"},
            { employeeId: new mongoose.Types.ObjectId("64f7a3ce0e8f1c1a8e7b4d27"), name: "Bob Smith" },
            {employeeId:new mongoose.Types.ObjectId("64f7a3d20e8f1c1a8e7b4d2b") , name:"Frank Harris"}
          ],
          workingOnProject: true
        },
        {
          teamId:new mongoose.Types.ObjectId("64f7a3c20e8f1c1a8e7b4d1b") ,
          teamName: "Marketing Masters",
          head: "Charlie Brown",
          projectId:new mongoose.Types.ObjectId("64e7b9c60e8f1c1a8f7a3c9c") ,
          clientId:new mongoose.Types.ObjectId("64e7f8c20e8f1c1a8f7a3c9f") ,
          members: [
            {employeeId:new mongoose.Types.ObjectId("64f7a3cf0e8f1c1a8e7b4d28"), name: "Charlie Brown" },
            { employeeId: new mongoose.Types.ObjectId("64f7a3d00e8f1c1a8e7b4d29"), name: "Diana Green" },
            {employeeId:new mongoose.Types.ObjectId("64f7a3d70e8f1c1a8e7b4d30"), name: "Kathy Black"}
          ],
          workingOnProject: true
        },
        {
          teamId:new mongoose.Types.ObjectId("64f7a3c30e8f1c1a8e7b4d1c") ,
          teamName: "Tech Wizards",
          head: "Xander Allen",
          projectId:new mongoose.Types.ObjectId("64e7b9c80e8f1c1a8f7a3c9e") ,
          clientId:new mongoose.Types.ObjectId("64e7f8c30e8f1c1a8f7a3ca0") ,
          members: [
            { employeeId: new mongoose.Types.ObjectId( "64f7a3d50e8f1c1a8e7b4d2e"),name: "Ivy Thomas"},
            { employeeId:  new mongoose.Types.ObjectId("64f7a3da0e8f1c1a8e7b4d33"), name: "Nina Carter" },
            {employeeId: new mongoose.Types.ObjectId("64f7a3de0e8f1c1a8e7b4d37"), name: "Rachel Lee"},
            {employeeId:new mongoose.Types.ObjectId("64f7a3e40e8f1c1a8e7b4d3d") , name: "Xander Allen",}
            
          ],
          workingOnProject: true
        },
        {
          teamId: new mongoose.Types.ObjectId("64f7a3c40e8f1c1a8e7b4d1d") ,
          teamName: "TechPioneers",
          head: "Harry King",
          projectId: new mongoose.Types.ObjectId("64e7b9ca0e8f1c1a8f7a3ca0") ,
          clientId: new mongoose.Types.ObjectId("64e7f8c40e8f1c1a8f7a3ca1") ,
          members: [
            { employeeId: new mongoose.Types.ObjectId("64f7a3df0e8f1c1a8e7b4d38"),  name: "Steve Miller"},
            {employeeId: new mongoose.Types.ObjectId("64f7a3d40e8f1c1a8e7b4d2d"),  name: "Harry King",}
          ],
          workingOnProject: true
        },
        {
          teamId:new mongoose.Types.ObjectId("64f7a3c50e8f1c1a8e7b4d1e") ,
          teamName: "CodeSmiths",
          head: "Paula Adams",
          projectId:new mongoose.Types.ObjectId("64e7b9cc0e8f1c1a8f7a3ca2") ,
          clientId:new mongoose.Types.ObjectId("64e7f8c50e8f1c1a8f7a3ca2") ,
          members: [
            { employeeId:new mongoose.Types.ObjectId("64f7a3dc0e8f1c1a8e7b4d35"),  name: "Paula Adams"},
            {employeeId: new mongoose.Types.ObjectId("64f7a3e50e8f1c1a8e7b4d3e") ,  name: "Yasmine Roberts"}
          ],
          workingOnProject: true
        },
        {
          teamId: new mongoose.Types.ObjectId("64f7a3c60e8f1c1a8e7b4d1f") ,
          teamName: "FutureTech",
          head: "Grace Lee",
          projectId: new mongoose.Types.ObjectId("64e7b9cd0e8f1c1a8f7a3ca3") ,
          clientId: new mongoose.Types.ObjectId("64e7f8c60e8f1c1a8f7a3ca3") ,
          members: [
            { employeeId: new mongoose.Types.ObjectId("64f7a3d30e8f1c1a8e7b4d2c"),  name: "Grace Lee" },
            {employeeId:new mongoose.Types.ObjectId( "64f7a3d60e8f1c1a8e7b4d2f"), name: "Jack White"}
          ],
          workingOnProject: true
        },
        {
            teamId:new mongoose.Types.ObjectId("64f7a3c70e8f1c1a8e7b4d20") ,
            teamName: "Innovators 2.0",
            head: "Uma Patel",
            projectId:new mongoose.Types.ObjectId("64e7b9ce0e8f1c1a8f7a3ca4") ,
            clientId:new mongoose.Types.ObjectId("64e7f8c70e8f1c1a8f7a3ca4") ,
            members: [
              { employeeId:new mongoose.Types.ObjectId("64f7a3e10e8f1c1a8e7b4d3a"), name: "Uma Patel" }
            ],
            workingOnProject: true
          },
          {
            teamId: new mongoose.Types.ObjectId("64f7a3c80e8f1c1a8e7b4d21"),
            teamName: "Sales Gurus",
            head: "Victor Harris",
            projectId: null,
            clientId:null,
            members: [
              { employeeId: new mongoose.Types.ObjectId( "64f7a3d90e8f1c1a8e7b4d32"), name: "Mona Collins" },
              { employeeId:new mongoose.Types.ObjectId("64f7a3e20e8f1c1a8e7b4d3b") , name: "Victor Harris"}
            ],
            workingOnProject: false
          },
          {
            teamId:new mongoose.Types.ObjectId("64f7a3c90e8f1c1a8e7b4d22") ,
            teamName: "Digital Masters",
            head: "Quincy Evans",
            projectId:null,
            clientId:null,
            members: [
              { employeeId: new mongoose.Types.ObjectId( "64f7a3dd0e8f1c1a8e7b4d36"), name: "Quincy Evans" },
              {employeeId: new mongoose.Types.ObjectId("64f7a3e00e8f1c1a8e7b4d39"), name: "Tina Young"}
            ],
            workingOnProject: false
          },
          {
            teamId: new mongoose.Types.ObjectId("64f7a3ca0e8f1c1a8e7b4d23"),
            teamName: "Marketing Pros",
            head: "Oscar Clark",
            projectId:null,
            clientId: null,
            members: [
              { employeeId: new mongoose.Types.ObjectId("64f7a3db0e8f1c1a8e7b4d34") , name: "Oscar Clark" }
            ],
            workingOnProject: false
          },
          {
            teamId:new mongoose.Types.ObjectId("64f7a3cb0e8f1c1a8e7b4d24") ,
            teamName: "Support Champs",
            head: "Eva White",
            projectId:null,
            clientId:null,
            members: [
              { employeeId: new mongoose.Types.ObjectId("64f7a3d10e8f1c1a8e7b4d2a") ,name: "Eva White"},
              {employeeId:  new mongoose.Types.ObjectId("64f7a3d80e8f1c1a8e7b4d31"),  name: "Liam Scott"}
            ],
            workingOnProject: false
          },
          {
            teamId:new mongoose.Types.ObjectId("64f7a3cc0e8f1c1a8e7b4d25")  ,
            teamName: "Tech Visionaries",
            head: "Wendy Clark",
            projectId:new mongoose.Types.ObjectId("64e7b9d00e8f1c1a8f7a3ca6") ,
            clientId:new mongoose.Types.ObjectId("64e7f8c90e8f1c1a8f7a3ca6")  ,
            members: [
              { employeeId: new mongoose.Types.ObjectId("64f7a3e30e8f1c1a8e7b4d3c"),name: "Wendy Clark", }
            ],
            workingOnProject: true
          }
    ],
    client:[
            {
                clientId:new mongoose.Types.ObjectId("64e7f8c10e8f1c1a8f7a3c9e") ,
                name: "Tech Solutions Ltd.",
                industry: "Technology",
                contactPersonName: "Sarah Mitchell",
                email: "sarah.mitchell@techsolutions.com",
                phoneNumber: "987-654-3210",
                location:"US",
                clientCreationDate: "2024-01-01T08:00:00Z",
                clientFinishDate: "2024-12-31T00:00:00Z",
                projectDetails: [
                  {
                    projectId:new mongoose.Types.ObjectId("64e7b9c50e8f1c1a8f7a3c9b")  ,
                    projectName: "Website Redesign",
                    projectStatus: "Running",
                    teamAssigned:new mongoose.Types.ObjectId("64f7a3c10e8f1c1a8e7b4d1a")  
                  }
                ]
              },
                {
                  clientId:new mongoose.Types
                  .ObjectId("64e7f8c20e8f1c1a8f7a3c9f") ,
                  name: "HealthTech Innovations",
                  industry: "Pharma Industry",
                  contactPersonName: "John Adams",
                  email: "john.adams@greentech.com",
                  phoneNumber: "555-123-4567",
                  location:"UK",
                  clientCreationDate: "2024-02-01T08:00:00Z",
                  clientFinishDate: "2024-11-30T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types
                      .ObjectId("64e7b9c60e8f1c1a8f7a3c9c") ,
                      projectName: "Health App Development",
                      projectStatus: "Completed",
                      teamAssigned:new mongoose.Types
                      .ObjectId( "64f7a3c20e8f1c1a8e7b4d1b")
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c30e8f1c1a8f7a3ca0") ,
                  name: "Easy Transactions",
                  industry: "Fintech",
                  contactPersonName: "Emma Roberts",
                  email: "emma.roberts@fashionforward.com",
                  phoneNumber: "555-234-5678",
                  location:"CA",
                  clientCreationDate: "2024-03-10T08:00:00Z",
                  clientFinishDate: "2024-12-15T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9c80e8f1c1a8f7a3c9e") ,
                      projectName: "Cloud Migration for FinTech",
                      projectStatus: "Running",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3c30e8f1c1a8e7b4d1c") 
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c40e8f1c1a8f7a3ca1") ,
                  name: "HealthMed Solutions",
                  industry: "Healthcare",
                  contactPersonName: "Sophia Turner",
                  email: "sophia.turner@healthmed.com",
                  phoneNumber: "555-345-6789",
                  location:"US",
                  clientCreationDate: "2024-04-01T08:00:00Z",
                  clientFinishDate: "2025-01-31T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9ca0e8f1c1a8f7a3ca0"), 
                      projectName: "Employee Training System",
                      projectStatus: "Running",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3c40e8f1c1a8e7b4d1d")  
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c50e8f1c1a8f7a3ca2") ,
                  name: "TechCorp Global",
                  industry: "Information Technology",
                  contactPersonName: "Michael Johnson",
                  email: "michael.johnson@techcorp.com",
                  phoneNumber: "555-456-7890",
                  location:"UK",
                  clientCreationDate: "2024-05-01T08:00:00Z",
                  clientFinishDate: "2025-05-01T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9cc0e8f1c1a8f7a3ca2") ,
                      projectName: "Data Analytics Dashboard",
                      projectStatus: "Running",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3c50e8f1c1a8e7b4d1e")  
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c60e8f1c1a8f7a3ca3") ,
                  name: "Sports Advisor",
                  industry: "Entertainment",
                  contactPersonName: "James Lee",
                  email: "james.lee@quickfood.com",
                  phoneNumber: "555-567-8901",
                  location:"CA",
                  clientCreationDate: "2024-06-15T08:00:00Z",
                  clientFinishDate: "2024-12-31T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9cd0e8f1c1a8f7a3ca3") ,
                      projectName: "Mobile App for Sports Fanatics",
                      projectStatus: "Completed",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3c60e8f1c1a8e7b4d1f")  
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c70e8f1c1a8f7a3ca4")  ,
                  name: "GlobalBanking Inc.",
                  industry: "Finance",
                  contactPersonName: "Linda Green",
                  email: "linda.green@globalbanking.com",
                  phoneNumber: "555-678-9012",
                  location:"FR",
                  clientCreationDate: "2024-07-01T08:00:00Z",
                  clientFinishDate: "2025-06-30T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9ce0e8f1c1a8f7a3ca4")  ,
                      projectName: "Enterprise Resource Planning System",
                      projectStatus: "Running",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3c70e8f1c1a8e7b4d20") 
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c80e8f1c1a8f7a3ca5")  ,
                  name: "UrbanSpace Realty",
                  industry: "Real Estate",
                  contactPersonName: "Oliver Brown",
                  email: "oliver.brown@urbanspace.com",
                  location:"JP",
                  phoneNumber: "555-789-0123",
                  clientCreationDate: "2024-08-10T08:00:00Z",
                  clientFinishDate: "",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9cb0e8f1c1a8f7a3ca1") ,
                      projectName: "AI Chatbot for Customer Support",
                      projectStatus: "Not Assigned",
                      teamAssigned: null
                    }
                  ]
                },
                {
                  clientId:new mongoose.Types.ObjectId("64e7f8c90e8f1c1a8f7a3ca6")  ,
                  name: "SmartHome Designs",
                  industry: "Tech",
                  contactPersonName: "Charlotte Harris",
                  email: "charlotte.harris@ecofurniture.com",
                  phoneNumber: "555-890-1234",
                  location:"JP",
                  clientCreationDate: "2024-09-01T08:00:00Z",
                  clientFinishDate: "2025-09-01T00:00:00Z",
                  projectDetails: [
                    {
                      projectId:new mongoose.Types.ObjectId("64e7b9d00e8f1c1a8f7a3ca6") ,
                      projectName: "Smart Home System Integration",
                      projectStatus: "Running",
                      teamAssigned:new mongoose.Types.ObjectId("64f7a3cc0e8f1c1a8e7b4d25")  
                    }
                  ]
                } 
    ],  
     transactions : [
        { month: "January", year: 2024, revenue: 50000, expenses: 30000, profit: 20000 },
        { month: "February", year: 2024, revenue: 60000, expenses: 45000, profit: 15000 },
        { month: "March", year: 2024, revenue: 40000, expenses: 50000, profit: -10000 },
        { month: "April", year: 2024, revenue: 55000, expenses: 37000, profit: 18000 },
        { month: "May", year: 2024, revenue: 62000, expenses: 46000, profit: 16000 },
        { month: "June", year: 2024, revenue: 68000, expenses: 51000, profit: 17000 },
        { month: "July", year: 2024, revenue: 75000, expenses: 56000, profit: 19000 },
        { month: "August", year: 2024, revenue: 72000, expenses: 50000, profit: 22000 },
        { month: "September", year: 2024, revenue: 78000, expenses: 54000, profit: 24000 },
        { month: "October", year: 2024, revenue: 70000, expenses: 49000, profit: 21000 },
        { month: "November", year: 2024, revenue: 76000, expenses: 52000, profit: 24000 },
        { month: "December", year: 2024, revenue: 80000, expenses: 55000, profit: 25000 }
      ],
    departments : [
        {
          departmentId: new mongoose.Types.ObjectId("64f7a3eb0e8f1c1a8e7b4d44"),
          name: "Management",
          departmentHead: "Alice Johnson",
          totalMembers: 15,
          budgetAllocated: 500000,
          status: "Running", // Can also be "Closed"
          averageRating: 4.6,
          totalRevenueGenerated: 250000
        },
        {
          departmentId: new  mongoose.Types.ObjectId("64f7a3ec0e8f1c1a8e7b4d45"),
          name: "Development",
          departmentHead: "Bob Smith",
          totalMembers: 25,
          budgetAllocated: 1000000,
          status: "Running",
          averageRating: 4.4,
          totalRevenueGenerated: 400000
        },
        {
          departmentId:new mongoose.Types.ObjectId("64f7a3ed0e8f1c1a8e7b4d46"),
          name: "Sales",
          departmentHead: "Charlie Brown",
          totalMembers: 20,
          budgetAllocated: 700000,
          status: "Running",
          averageRating: 4.7,
          totalRevenueGenerated: 500000
        },
        {
          departmentId: new mongoose.Types.ObjectId("64f7a3ee0e8f1c1a8e7b4d47"),
          name: "Marketing",
          departmentHead: "Diana Green",
          totalMembers: 18,
          budgetAllocated: 600000,
          status: "Running",
          averageRating: 4.5,
          totalRevenueGenerated: 300000
        },
        {
          departmentId: new mongoose.Types.ObjectId("64f7a3ef0e8f1c1a8e7b4d48"),
          name: "Customer Support",
          departmentHead: "Eva White",
          totalMembers: 10,
          budgetAllocated: 250000,
          status: "Closed", // Example of a department that has been closed
          averageRating: 4.3,
          totalRevenueGenerated: 120000
        }
      ],
    employeePerformance: [
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3cd0e8f1c1a8e7b4d26") ,
    name: "Alice Johnson",
    monthlyOvertimeHours: [10, 12, 8],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [2000, 2500, 2300],
    goals: [
      {
        goal: "Complete 5 projects",
        progress: 80,
        status: "In Progress"
      },
      {
        goal: "Improve team collaboration",
        progress: 100,
        status: "Completed"
      },
      {
        goal: "Enhance client communication",
        progress: 50,
        status: "In Progress"
      }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3ce0e8f1c1a8e7b4d27") ,
    name: "Bob Smith",
    monthlyOvertimeHours: [12, 15, 18],
    monthlyClientRatings: [4.2, 4.3, 4.5],
    monthlyContributions: [1800, 2200, 2500],
    goals: [
      {
        goal: "Increase productivity",
        progress: 75,
        status: "In Progress"
      },
      {
        goal: "Develop 3 new features",
        progress: 50,
        status: "In Progress"
      },
      {
        goal: "Enhance code quality",
        progress: 90,
        status: "In Progress"
      }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3cf0e8f1c1a8e7b4d28") ,
    name: "Charlie Brown",
    monthlyOvertimeHours: [8, 10, 11],
    monthlyClientRatings: [4.3, 4.4, 4.5],
    monthlyContributions: [1900, 2100, 2400],
    goals: [
      {
        goal: "Increase sales by 20%",
        progress: 65,
        status: "In Progress"
      },
      {
        goal: "Attend 2 professional development workshops",
        progress: 100,
        status: "Completed"
      },
      {
        goal: "Improve lead generation",
        progress: 40,
        status: "In Progress"
      }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d00e8f1c1a8e7b4d29") ,
    name: "Diana Green",
    monthlyOvertimeHours: [10, 12, 8],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [2000, 2500, 2300],
    goals: [
      { goal: "Complete 5 projects", progress: 80, status: "In Progress" },
      { goal: "Improve team collaboration", progress: 100, status: "Completed" },
      { goal: "Enhance client communication", progress: 50, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d10e8f1c1a8e7b4d2a") ,
    name: "Eva White",
    monthlyOvertimeHours: [12, 15, 18],
    monthlyClientRatings: [4.2, 4.3, 4.5],
    monthlyContributions: [1800, 2200, 2500],
    goals: [
      { goal: "Increase productivity", progress: 75, status: "In Progress" },
      { goal: "Develop 3 new features", progress: 50, status: "In Progress" },
      { goal: "Enhance code quality", progress: 90, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d20e8f1c1a8e7b4d2b") ,
    name: "Frank Harris",
    monthlyOvertimeHours: [8, 10, 11],
    monthlyClientRatings: [4.3, 4.4, 4.5],
    monthlyContributions: [1900, 2100, 2400],
    goals: [
      { goal: "Increase sales by 20%", progress: 65, status: "In Progress" },
      { goal: "Attend 2 professional development workshops", progress: 100, status: "Completed" },
      { goal: "Improve lead generation", progress: 40, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d30e8f1c1a8e7b4d2c") ,
    name: "Grace Lee",
    monthlyOvertimeHours: [14, 16, 12],
    monthlyClientRatings: [4.6, 4.7, 4.8],
    monthlyContributions: [2100, 2500, 2300],
    goals: [
      { goal: "Lead 3 successful sales campaigns", progress: 85, status: "In Progress" },
      { goal: "Increase customer satisfaction", progress: 70, status: "In Progress" },
      { goal: "Close 10 new deals", progress: 60, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d40e8f1c1a8e7b4d2d") ,
    name: "Harry King",
    monthlyOvertimeHours: [9, 11, 13],
    monthlyClientRatings: [4.4, 4.6, 4.7],
    monthlyContributions: [2000, 2200, 2400],
    goals: [
      { goal: "Complete project milestones on time", progress: 100, status: "Completed" },
      { goal: "Improve team communication", progress: 90, status: "In Progress" },
      { goal: "Enhance client collaboration", progress: 60, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId( "64f7a3d50e8f1c1a8e7b4d2e"),
    name: "Ivy Thomas",
    monthlyOvertimeHours: [8, 10, 12],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [1800, 2100, 2200],
    goals: [
      { goal: "Develop 2 new website features", progress: 80, status: "In Progress" },
      { goal: "Enhance web performance", progress: 95, status: "In Progress" },
      { goal: "Improve frontend design", progress: 70, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId( "64f7a3d60e8f1c1a8e7b4d2f"),
    name: "Jack White",
    monthlyOvertimeHours: [12, 14, 16],
    monthlyClientRatings: [4.3, 4.5, 4.6],
    monthlyContributions: [1900, 2300, 2400],
    goals: [
      { goal: "Increase sales volume by 30%", progress: 80, status: "In Progress" },
      { goal: "Enhance client relationships", progress: 85, status: "In Progress" },
      { goal: "Train new sales recruits", progress: 60, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d70e8f1c1a8e7b4d30") ,
    name: "Kathy Black",
    monthlyOvertimeHours: [9, 11, 10],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [2000, 2200, 2300],
    goals: [
      { goal: "Manage successful marketing campaigns", progress: 100, status: "Completed" },
      { goal: "Grow social media presence by 20%", progress: 90, status: "In Progress" },
      { goal: "Increase website traffic by 25%", progress: 70, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3d80e8f1c1a8e7b4d31") ,
    name: "Liam Scott",
    monthlyOvertimeHours: [10, 12, 14],
    monthlyClientRatings: [4.3, 4.5, 4.6],
    monthlyContributions: [2000, 2100, 2300],
    goals: [
      { goal: "Complete 2 product launches", progress: 90, status: "In Progress" },
      { goal: "Increase product sales by 15%", progress: 60, status: "In Progress" },
      { goal: "Improve customer feedback collection", progress: 75, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId( "64f7a3d90e8f1c1a8e7b4d32"),
    name: "Mona Collins",
    monthlyOvertimeHours: [8, 9, 10],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [1900, 2050, 2150],
    goals: [
      { goal: "Complete 3 client projects", progress: 85, status: "In Progress" },
      { goal: "Increase customer retention by 10%", progress: 70, status: "In Progress" },
      { goal: "Improve team collaboration", progress: 90, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3da0e8f1c1a8e7b4d33") ,
    name: "Nina Carter",
    monthlyOvertimeHours: [7, 6, 5],
    monthlyClientRatings: [4.0, 4.2, 4.1],
    monthlyContributions: [1800, 1750, 1700],
    goals: [
      { goal: "Launch new product features", progress: 80, status: "In Progress" },
      { goal: "Enhance customer service responsiveness", progress: 60, status: "In Progress" },
      { goal: "Work on team communication skills", progress: 65, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3db0e8f1c1a8e7b4d34") ,
    name: "Oscar Clark",
    monthlyOvertimeHours: [10, 11, 9],
    monthlyClientRatings: [4.8, 4.9, 5.0],
    monthlyContributions: [2100, 2250, 2300],
    goals: [
      { goal: "Optimize SEO strategy", progress: 95, status: "In Progress" },
      { goal: "Increase social media engagement by 20%", progress: 85, status: "In Progress" },
      { goal: "Launch new marketing campaigns", progress: 90, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3dc0e8f1c1a8e7b4d35") ,
    name: "Paula Adams",
    monthlyOvertimeHours: [6, 7, 8],
    monthlyClientRatings: [4.3, 4.4, 4.6],
    monthlyContributions: [1900, 2000, 2100],
    goals: [
      { goal: "Lead new product development", progress: 88, status: "In Progress" },
      { goal: "Improve sales performance in new regions", progress: 75, status: "In Progress" },
      { goal: "Train 3 new team members", progress: 80, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId( "64f7a3dd0e8f1c1a8e7b4d36"),
    name: "Quincy Evans",
    monthlyOvertimeHours: [8, 10, 9],
    monthlyClientRatings: [4.7, 4.8, 4.9],
    monthlyContributions: [2100, 2200, 2300],
    goals: [
      { goal: "Improve UI design for new platform", progress: 90, status: "In Progress" },
      { goal: "Increase platform usability by 15%", progress: 85, status: "In Progress" },
      { goal: "Collaborate on cross-department projects", progress: 80, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3de0e8f1c1a8e7b4d37") ,
    name: "Rachel Lee",
    monthlyOvertimeHours: [7, 8, 6],
    monthlyClientRatings: [4.5, 4.6, 4.7],
    monthlyContributions: [2000, 2100, 2200],
    goals: [
      { goal: "Complete 2 major marketing campaigns", progress: 85, status: "In Progress" },
      { goal: "Increase brand awareness by 10%", progress: 90, status: "In Progress" },
      { goal: "Boost customer engagement by 15%", progress: 80, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3df0e8f1c1a8e7b4d38") ,
    name: "Steve Miller",
    monthlyOvertimeHours: [12, 13, 14],
    monthlyClientRatings: [4.4, 4.5, 4.6],
    monthlyContributions: [2200, 2400, 2500],
    goals: [
      { goal: "Increase product sales by 20%", progress: 85, status: "In Progress" },
      { goal: "Improve customer service response times", progress: 75, status: "In Progress" },
      { goal: "Develop new client acquisition strategies", progress: 80, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e00e8f1c1a8e7b4d39") ,
    name: "Tina Young",
    monthlyOvertimeHours: [8, 10, 9],
    monthlyClientRatings: [4.6, 4.7, 4.8],
    monthlyContributions: [2100, 2200, 2300],
    goals: [
      { goal: "Improve product delivery timelines", progress: 90, status: "In Progress" },
      { goal: "Increase client retention rate", progress: 80, status: "In Progress" },
      { goal: "Enhance overall project efficiency", progress: 85, status: "In Progress" }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e10e8f1c1a8e7b4d3a") ,
    name: "Uma Patel",
    monthlyOvertimeHours: [7, 6, 5],
    monthlyClientRatings: [4.1, 4.2, 4.3],
    monthlyContributions: [1750, 1800, 1850],
    goals: [
      {
        goal: "Develop an improved training program for new hires",
        progress: 75,
        status: "In Progress"
      },
      { 
        goal: "Expand brand presence in international markets",
        progress: 60,
        status: "In Progress"
      },
      {
        goal: "Improve internal communication between departments",
        progress: 70,
        status: "In Progress"
      }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e20e8f1c1a8e7b4d3b"),
    name: "Victor Harris",
    monthlyOvertimeHours: [9, 8, 7 ],    
     monthlyClientRatings: [4.6, 4.7, 4.8],
    monthlyContributions: [2200, 2300, 2400],
    goals: [
      {
        goal: "Improve website UI/UX design",
        progress: 90,
        status: "In Progress"
      },
      {
        goal: "Increase user engagement on the platform by 15%",
        progress: 85,
        status: "In Progress"
      },
      {
        goal: "Create new content for marketing campaigns",
        progress: 80,
        statu: "In Progress"
      }
    ]
  },  
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e30e8f1c1a8e7b4d3c") ,
    name: "Wendy Clark",
    onthlyOvertimeHours: [10, 11, 9],
 monthlyClientRatings: [4.8, 4.9, 5.0],
    monthlyContributions: [2500, 2600, 2700],
    oals: [
      {
        goal: "Improve company's brand image",
        progress: 100,
        status: "Completed"
     },
      {
        goal: "Improve company's social media outreach",
        progress: 95,
        status: "In Progress"
     },
      {
        goal: "Collaborate with other teams for cross-functional projects",
        progress: 85,
        statu: "In Progress"
      }
    ]
  },
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e40e8f1c1a8e7b4d3d") ,
    name: "Xander Allen",
    monthlyOvertimeHours: [8, 7, 6],
    monthlyClientRatings: [4.4, 4.5, 4.6],
    monthlyContributions: [2100, 2200, 2300],
    goals: [
      {
       goal: "Launch new product feature",
        progress: 85,
        status: "In rogress"
    },
      {
        goal: "Increase product awareness by 20%",
        progress: 80,
        statu: "In Progress"
      },
      {
        goal: "Improve customer support response times",
        progress: 70,
        statu: "In Progress"
      }
    ]
},
  {
    employeeId:new mongoose.Types.ObjectId("64f7a3e50e8f1c1a8e7b4d3e") ,
    name: "Yasmine Roberts",
    monthlyOvertimeHours: [6, 5, 7],
    monthlyClientRatings: [4.3, 4.5, 4.4],
    monthlyContributions: [1800, 1900, 2000],
    goals: [
      {
        goal: "Improve onboarding process for new employees",
      progress: 80,
    status: "In Progress"
      },
      {
        goal: "Increase customer satisfaction by 10%",
        progress: 75,
        status: "In Progress"
      },
      {
        goal: "Work on leadership skills and team management",
        progress: 70,
        status: "In Progress"
      }
    ]
}
      ],
      users:[
        {
           _id:"63701cc1f03239b7f700000e",
            name: "Sahil Mehra",
            email: "sahil@gmail.com",
            password: "securepassword123",
            phoneNumber: "9999999999",
           
            city: "New York",
            state: "New York",
            country: "USA",
            position: "Software Engineer",
            role: "Super Admin", // Can also be "Admin" or "Super Admin"
          }
        
        ]    

  };
   

  // function validateProjectTeams(projectTeams) {
  //   const errors = [];
  
  //   projectTeams.forEach((team, index) => {
  //     const { teamId, teamName, head, projectId, clientId, members, workingOnProject } = team;
  
  //     // Check if teamId is a valid ObjectId
  //     if (!mongoose.Types.ObjectId.isValid(teamId)) {
  //       errors.push(`Invalid teamId at index ${index}: ${teamId}`);
  //     }
  
  //     // Validate teamName
  //     if (typeof teamName !== "string" || teamName.trim() === "") {
  //       errors.push(`Invalid teamName at index ${index}: ${teamName}`);
  //     }
  
  //     // Validate head
  //     if (typeof head !== "string" || head.trim() === "") {
  //       errors.push(`Invalid head at index ${index}: ${head}`);
  //     }
  
  //     // Check if projectId is valid or null
  //     if (projectId && !mongoose.Types.ObjectId.isValid(projectId)) {
  //       errors.push(`Invalid projectId at index ${index}: ${projectId}`);
  //     }
  
  //     // Check if clientId is valid or null
  //     if (clientId && !mongoose.Types.ObjectId.isValid(clientId)) {
  //       errors.push(`Invalid clientId at index ${index}: ${clientId}`);
  //     }
  
  //     // Validate members array
  //     if (!Array.isArray(members) || members.length === 0) {
  //       errors.push(`Invalid members array at index ${index}`);
  //     } else {
  //       members.forEach((member, memberIndex) => {
  //         const { employeeId, name } = member;
  
  //         // Validate employeeId
  //         if (!mongoose.Types.ObjectId.isValid(employeeId)) {
  //           errors.push(`Invalid employeeId at index ${index}, memberIndex ${memberIndex}: ${employeeId}`);
  //         }
  
  //         // Validate name
  //         if (typeof name !== "string" || name.trim() === "") {
  //           errors.push(`Invalid name at index ${index}, memberIndex ${memberIndex}: ${name}`);
  //         }
  //       });
  //     }
  
  //     // Validate workingOnProject
  //     if (typeof workingOnProject !== "boolean") {
  //       errors.push(`Invalid workingOnProject at index ${index}: ${workingOnProject}`);
  //     }
  //   });
  
  //   return errors;
  // }
  // const validationErrors = validateProjectTeams(data.projectTeams);

  // if (validationErrors.length > 0) {
  //   console.log("Validation Errors:", validationErrors);
  // } else {
  //   console.log("All project teams are valid.");
  // }  

  export default data
  
  