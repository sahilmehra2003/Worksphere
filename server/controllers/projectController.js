import Project from '../models/projectSchema.js';


export const getAllProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('clientId').populate('teamId');
        res.status(200).json(projects);
    } catch (error) {
        console.error('Error fetching projects:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('clientId').populate('teamId');
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.status(200).json(project);
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

// Controller to create a new project
export const createProject=async(req,res)=>{
   try {
       const {name,description,status,startDate,clientId,endDate,budget,totalExpenses,teamId}=req.body;
       if (!name || !status || !startDate || !budget ) {
              return res.status(400).json({
                success:false,
                message:"Missing Fields"
              })
       }
       const newProject=new Project({
            name:name,
            description:description,
            teamId:teamId,
            clientId:clientId,
            startDate:startDate,
            endDate:endDate,
            budget:budget,
            totalExpenses:totalExpenses,
            status:status
       })
       await newProject.save();
       return res.status(200).json({
        success:true,
        message:"New Project created successfully",
        project:newProject
       })
   } catch (error) {
     return res.status(500).json({
        success:false,
        message:`Error is: ${error}`
     })
   }
}

export const updateProject=async(req,res)=>{
  try {
       const {id}=req.params
       const updatedProjectData=await Project.findByIdAndUpdate(id,req.body);
       if (!updatedProjectData) {
          return res.status(400).json({
            success:false,
            message:"Project not Found"
          })
       }
       return res.status(200).json({
         success:true,
         message:"Employee updated successfully!",
         project:updatedProjectData
       })
  } catch (error) {
    return res.status(500).json({
      success:false,
      message:`Error is: ${error}`
    })
  }
}