import mongoose from "mongoose";

// Client schema
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim:true
  },
  contactPersonName: {
    type: String,
    required: true,
    trim:true
  },
  email: {
    type: String,
    required: true,
    match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^\d{10}$/, 'Please enter a valid 10-digit phone number']
  },
  location:{
    type:String,
    required:true,
    trim:true
  },
  latLng: {
    lat: { type: Number, default: null },
    lng: { type: Number, default: null }
  },
  clientCreationDate: {
    type: Date,
    default: Date.now
  },
  clientFinishDate: {
    type: Date,
    default:null
  },
  project:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"Project",
    default:null
  }],
  projectTeam:[{
    type:mongoose.Schema.Types.ObjectId,
    ref:"ProjectTeam",
    default:null
  }],
  department:[
    {
       type:mongoose.Schema.Types.ObjectId,
       ref:"Department",
       default:null
    }
  ],
  status:{
    type:Boolean,
    default:false
  },
  paymentAfterCompletion: {
    type: Number,
    default: null,
    validate: {
      validator: function (value) {
        if (this.status && (value === null || value <= 0)) {
          return false;
        }
        return true;
      },
      message: "Total contribution must be a positive number when the project is finished",
    },
  },
},{ timestamps: true }
);


const Client = mongoose.model('Client', clientSchema);

export default Client;
