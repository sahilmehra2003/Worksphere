import ProjectTeam from "../models/projectTeamSchema.js";

export const createTeam=async (req,res)=>{
    try {
        const {teamName,teamHead,description,workingOnProject,isInternalProject,members,projectId,clientId}=req.body;
        if (!teamName || !teamHead || !description) {
            return res.status(400).json({
                success:false,
                message:"Missing Fields"
            })
        }
        const newTeam=await ProjectTeam.create({
            teamName:teamName,
            teamHead:teamHead,
            description:description,
            workingOnProject:workingOnProject,
            isInternalProject:isInternalProject,
            members:members,
            projectId:projectId,
            clientId:clientId
        })
        return res.status(200).json({
            success:true,
            message:"New team created successfully",
            projectTeam:newTeam
        })
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error is: ${error}`
        })
    }
}

export const updateTeam=async (req,res)=>{
    try {
        const {id}=req.params;
        const updatedTeamData=await ProjectTeam.findByIdAndUpdate(id,req.body);
        if (!updatedTeamData) {
            return res.status(400).json({
                success:false,
                message:"Project team not found"
            })
            
        }    
        return res.status(200).json({
            success:true,
            message:"Team updated successfully",
        })    
    } catch (error) {
        return res.status(500).json({
            success:false,
            message:`Error is: ${error}`
        })
    }
}