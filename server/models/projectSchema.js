import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim:true 
  },
  description: { 
    type: String,
    trim:true 
  },
  clientId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref:'Client'  
  },
  status: { 
    type: String, 
    enum: ['In Progress', 'Completed', 'Abandoned', 'Not Assigned'], 
    required: true 
  },
  startDate: { 
    type: Date, 
    required: true,
    default:Date.now
  },
  endDate: { 
    type: Date,
    default:null
  },
  teamId: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'ProjectTeam', 
    default: [] 
  }], // Empty if no team is assigned
  departmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref:'Department'
  },
  budget: { 
    type: Number, 
    required: true 
  },
  totalExpenses: { 
    type: Number, 
    default:null,
    validate:{
      validator:function(value){
        if (this.status==="Completed" && typeof value!=="number") {
            return false
        }
        if (this.status!=="Completed" && value!==null) {
             return false
        }
        return true;
      },
      message:"Value must be null in case project status is not completed"
    } 
  },
});

const Project = mongoose.model('Project', projectSchema);
export default Project

