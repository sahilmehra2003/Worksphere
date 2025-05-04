import mongoose from "mongoose";

const projectTeamSchema = new mongoose.Schema({
  teamName: 
  { 
    type: String, 
    required: true,
    trim:true 
  }, // Updated from `name` to `teamName`
  teamHead: 
  { 
     type: mongoose.Schema.Types.ObjectId,
     ref:"Employee",
     required: true 
  }, 
  description: { 
    type: String,
    trim:true 
  },
  members: [
    {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Employee', 
        default:[]
    },
  ],
  workingOnProject: { 
    type: Boolean, 
    default: false,
    required:true
  },
  isInternalProject: {
    type: Boolean,
    default: false // true for internal projects, false for client projects
  },
  projectId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project', 
    default: null 
  },
  departmenntId:{
     type:mongoose.Schema.Types.ObjectId,
     ref:'Department',
     default:null
  }, 
  clientId: 
  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client',
    default:null,
    validate:{
      validator:function(clientId){
           if (!this.workingOnProject) {
              return clientId===null;
           }
          // If it's not an internal project and projectId exists, clientId must be provided
            if (!this.isInternalProject && this.projectId && !clientId) {
                return false;
            }
            return true;
      },
      message:"Client ID is required for client project"
    }
    
  } 
});
const ProjectTeam = mongoose.model('ProjectTeam', projectTeamSchema);
export default ProjectTeam

