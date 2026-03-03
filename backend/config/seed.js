// backend/config/seed.js
import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "./db.js";
import User from "../models/user.js";
import bcrypt from "bcryptjs";

dotenv.config();
await connectDB();

const seed = async () => {
  try {
    // create admin
    const adminEmail = "admin@arogyam.local";
    const adminExists = await User.findOne({ email: adminEmail });
    if (!adminExists) {
      const hash = await bcrypt.hash("admin123", 10);
      await User.create({ name: "System Admin", email: adminEmail, password: hash, role: "admin" });
      console.log("Admin created");
    } else {
      console.log("Admin exists");
    }

    // create doctors with specializations - ALL TYPES
    const docs = [
      { 
        name: "Dr. Sita Sharma", 
        email: "sita@arogyam.local", 
        role: "doctor",
        specialization: "Cardiologist",
        experience: 15,
        qualification: "MD, DM Cardiology",
        consultationFee: 1500,
        bio: "Expert in heart diseases and cardiovascular health",
        picture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
      },
      { 
        name: "Dr. Ram Thapa", 
        email: "ram@arogyam.local", 
        role: "doctor",
        specialization: "Neurologist",
        experience: 12,
        qualification: "MD, DM Neurology",
        consultationFee: 2000,
        bio: "Specialist in brain and nervous system disorders",
        picture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
      },
      { 
        name: "Dr. Priya Adhikari", 
        email: "priya@arogyam.local", 
        role: "doctor",
        specialization: "Gynecologist",
        experience: 10,
        qualification: "MD, DGO",
        consultationFee: 1200,
        bio: "Women's health and reproductive care specialist",
        picture: "https://images.unsplash.com/photo-1594824476968-48df8b7552b2?w=400"
      },
      { 
        name: "Dr. Rajesh Karki", 
        email: "rajesh@arogyam.local", 
        role: "doctor",
        specialization: "Dermatologist",
        experience: 8,
        qualification: "MD, DDVL",
        consultationFee: 1000,
        bio: "Skin, hair, and nail care expert",
        picture: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=400"
      },
      { 
        name: "Dr. Anjali Shrestha", 
        email: "anjali@arogyam.local", 
        role: "doctor",
        specialization: "Pediatrician",
        experience: 14,
        qualification: "MD, DCH",
        consultationFee: 1100,
        bio: "Child health and development specialist",
        picture: "https://images.unsplash.com/photo-1551601651-2a8555f1a136?w=400"
      },
      { 
        name: "Dr. Bikash Tamang", 
        email: "bikash@arogyam.local", 
        role: "doctor",
        specialization: "Orthopedic",
        experience: 16,
        qualification: "MS Orthopedics",
        consultationFee: 1800,
        bio: "Bone, joint, and muscle specialist",
        picture: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400"
      },
      { 
        name: "Dr. Sunita Basnet", 
        email: "sunita@arogyam.local", 
        role: "doctor",
        specialization: "Psychiatrist",
        experience: 11,
        qualification: "MD Psychiatry",
        consultationFee: 1500,
        bio: "Mental health and psychological wellness expert",
        picture: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400"
      },
      { 
        name: "Dr. Kumar Gurung", 
        email: "kumar@arogyam.local", 
        role: "doctor",
        specialization: "General Physician",
        experience: 20,
        qualification: "MBBS, MD General Medicine",
        consultationFee: 800,
        bio: "Comprehensive primary healthcare provider",
        picture: "https://images.unsplash.com/photo-1537368910022-7000d7d737e8?w=400"
      },
      { 
        name: "Dr. Nabin Poudel", 
        email: "nabin@arogyam.local", 
        role: "doctor",
        specialization: "ENT Specialist",
        experience: 13,
        qualification: "MS ENT",
        consultationFee: 1300,
        bio: "Ear, nose, and throat specialist",
        picture: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400"
      },
      { 
        name: "Dr. Meera Joshi", 
        email: "meera@arogyam.local", 
        role: "doctor",
        specialization: "Ophthalmologist",
        experience: 9,
        qualification: "MS Ophthalmology",
        consultationFee: 1400,
        bio: "Eye care and vision specialist",
        picture: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400"
      },
      { 
        name: "Dr. Ramesh Shrestha", 
        email: "ramesh@arogyam.local", 
        role: "doctor",
        specialization: "Dentist",
        experience: 7,
        qualification: "BDS, MDS",
        consultationFee: 900,
        bio: "Dental care and oral health specialist",
        picture: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400"
      },
      { 
        name: "Dr. Deepak K.C.", 
        email: "deepak@arogyam.local", 
        role: "doctor",
        specialization: "General Surgeon",
        experience: 18,
        qualification: "MS General Surgery",
        consultationFee: 2200,
        bio: "Surgical procedures and treatment specialist",
        picture: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=400"
      }
    ];
    for (const d of docs) {
      const ex = await User.findOne({ email: d.email });
      if (!ex) {
        const hash = await bcrypt.hash("doctor123", 10);
        await User.create({ 
          name: d.name, 
          email: d.email, 
          password: hash, 
          role: "doctor",
          specialization: d.specialization,
          experience: d.experience,
          qualification: d.qualification,
          consultationFee: d.consultationFee,
          bio: d.bio,
          picture: d.picture
        });
        console.log("Created", d.email, "-", d.specialization);
      } else {
        // Update existing doctor with new fields
        await User.updateOne(
          { email: d.email },
          { 
            specialization: d.specialization,
            experience: d.experience,
            qualification: d.qualification,
            consultationFee: d.consultationFee,
            bio: d.bio,
            picture: d.picture
          }
        );
        console.log("Updated", d.email, "-", d.specialization);
      }
    }

    console.log("Seed finished");
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seed();
