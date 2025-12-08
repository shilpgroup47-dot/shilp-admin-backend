require('dotenv').config();
const JobOpening = require('./src/models/JobOpening');
const { connectDatabase } = require('./src/config/database');

const sampleJobOpenings = [
  {
    title: "Facilities and Maintenance Executive",
    description: "We are seeking a dedicated Facilities and Maintenance Executive to oversee the maintenance and operation of our facilities. The ideal candidate will ensure all building systems operate efficiently and safely.",
    experience: "2+ Years Experience",
    location: "Ahmedabad, Gujarat",
    department: "Operations",
    employmentType: "Full-time",
    requirements: "• Bachelor's degree in Engineering or related field\n• 2+ years experience in facility management\n• Knowledge of HVAC, electrical, and plumbing systems\n• Strong problem-solving skills\n• Excellent communication abilities",
    responsibilities: "• Oversee daily facility operations\n• Coordinate maintenance activities\n• Manage vendor relationships\n• Ensure compliance with safety regulations\n• Prepare maintenance reports and budgets",
    salary: "₹3.5-5.5 LPA",
    isActive: true,
    sortOrder: 1
  },
  {
    title: "Pre-Sales Executive",
    description: "Join our dynamic sales team as a Pre-Sales Executive where you'll play a crucial role in supporting our sales process and helping clients understand our solutions.",
    experience: "2+ Years Experience", 
    location: "Ahmedabad, Gujarat",
    department: "Sales",
    employmentType: "Full-time",
    requirements: "• Bachelor's degree in Business, Marketing, or related field\n• 2+ years experience in sales or customer-facing roles\n• Excellent presentation and communication skills\n• Knowledge of CRM systems\n• Strong analytical abilities",
    responsibilities: "• Support sales team with technical expertise\n• Conduct product demonstrations\n• Prepare proposals and presentations\n• Build relationships with prospective clients\n• Collaborate with engineering teams",
    salary: "₹4-6 LPA + Incentives",
    isActive: true,
    sortOrder: 2
  },
  {
    title: "AGM - Civil Engineering",
    description: "We are looking for an experienced Assistant General Manager - Civil Engineering to lead our civil engineering projects and teams.",
    experience: "8+ Years Experience",
    location: "Ahmedabad, Gujarat", 
    department: "Engineering",
    employmentType: "Full-time",
    requirements: "• Bachelor's degree in Civil Engineering\n• 8+ years experience in civil engineering projects\n• Project management certification preferred\n• Strong leadership and team management skills\n• Knowledge of construction codes and regulations",
    responsibilities: "• Lead civil engineering projects from conception to completion\n• Manage engineering teams and resources\n• Ensure project quality and timeline adherence\n• Coordinate with clients and stakeholders\n• Review and approve technical drawings",
    salary: "₹12-18 LPA",
    isActive: true,
    sortOrder: 3
  },
  {
    title: "Junior Civil Engineer",
    description: "Exciting opportunity for a Junior Civil Engineer to join our growing engineering team and contribute to innovative construction projects.",
    experience: "1-3 Years Experience",
    location: "Ahmedabad, Gujarat",
    department: "Engineering", 
    employmentType: "Full-time",
    requirements: "• Bachelor's degree in Civil Engineering\n• 1-3 years relevant experience\n• Knowledge of AutoCAD and other design software\n• Understanding of construction materials and methods\n• Strong attention to detail",
    responsibilities: "• Assist in project planning and design\n• Prepare technical drawings and specifications\n• Conduct site inspections and surveys\n• Support senior engineers in project execution\n• Maintain project documentation",
    salary: "₹2.5-4 LPA",
    isActive: true,
    sortOrder: 4
  },
  {
    title: "Billing and Planning Engineer",
    description: "We are seeking a detail-oriented Billing and Planning Engineer to manage project billing processes and contribute to project planning activities.",
    experience: "3+ Years Experience",
    location: "Ahmedabad, Gujarat",
    department: "Finance",
    employmentType: "Full-time", 
    requirements: "• Bachelor's degree in Engineering or related field\n• 3+ years experience in billing and planning\n• Proficiency in MS Excel and planning software\n• Knowledge of construction industry practices\n• Strong analytical and mathematical skills",
    responsibilities: "• Prepare project bills and cost estimates\n• Monitor project expenses and budgets\n• Coordinate with project teams for billing updates\n• Generate financial reports and analytics\n• Support contract management activities",
    salary: "₹4-6.5 LPA",
    isActive: true,
    sortOrder: 5
  }
];

async function seedJobOpenings() {
  try {
    // Connect to database
    await connectDatabase();
    
    console.log('🌱 Seeding job openings...');
    
    // Clear existing job openings (optional)
    // await JobOpening.deleteMany({});
    
    // Insert sample job openings
    for (const jobData of sampleJobOpenings) {
      const existingJob = await JobOpening.findOne({ title: jobData.title });
      
      if (!existingJob) {
        const job = new JobOpening(jobData);
        await job.save();
        console.log(`✅ Created job opening: ${jobData.title}`);
      } else {
        console.log(`⚠️  Job opening already exists: ${jobData.title}`);
      }
    }
    
    console.log('🎉 Job openings seeding completed!');
    
    // Get count of job openings
    const count = await JobOpening.countDocuments();
    console.log(`📊 Total job openings in database: ${count}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding job openings:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedJobOpenings();