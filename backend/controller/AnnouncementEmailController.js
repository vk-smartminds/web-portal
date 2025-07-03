import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Guardian from '../models/Guardian.js';
import Admin from '../models/Admin.js';
import nodemailer from 'nodemailer';

const emailUser = process.env.EMAIL_USER;
const emailPass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/"/g, '') : '';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: emailUser,
    pass: emailPass
  }
});

// Function to send announcement emails
export const sendAnnouncementEmails = async (announcementFor, classes, announcementText, createdBy) => {
    try {
      if (!emailUser || !emailPass) {
        console.error('EMAIL_USER or EMAIL_PASS missing for announcement emails');
        return { successful: 0, failed: 0, total: 0, error: 'Email credentials not configured' };
      }
  
      // Truncate announcement text for email (first 15 characters)
      const maxEmailLength = 50;
      const truncatedText = announcementText.length > maxEmailLength 
        ? announcementText.substring(0, maxEmailLength) + '...'
        : announcementText;
  
      const emailRecipients = [];
      const normalizedAnnouncementFor = announcementFor.map(role => role.toLowerCase());
  
      // Handle "All" option
      if (normalizedAnnouncementFor.includes('all')) {
        // Send to all users (Student, Teacher, Guardian) and all admins
        const [allStudents, allTeachers, allGuardians, allAdmins] = await Promise.all([
          Student.find({}),
          Teacher.find({}),
          Guardian.find({}),
          Admin.find({})
        ]);
        
        allStudents.forEach(student => {
          emailRecipients.push({
            email: student.email,
            name: student.name,
            registeredAs: 'Student',
            message: `A new announcement has been made for you.`
          });
        });
        
        allTeachers.forEach(teacher => {
          emailRecipients.push({
            email: teacher.email,
            name: teacher.name,
            registeredAs: 'Teacher',
            message: `A new announcement has been made for you.`
          });
        });
        
        allGuardians.forEach(guardian => {
          emailRecipients.push({
            email: guardian.email,
            name: guardian.name,
            registeredAs: 'Guardian',
            message: `A new announcement has been made for you.`
          });
        });
        
        allAdmins.forEach(admin => {
          emailRecipients.push({
            email: admin.email,
            name: admin.name || 'Admin',
            registeredAs: 'Admin',
            message: `A new announcement has been made for you.`
          });
        });
      } else {
        // Handle specific roles
        for (const role of normalizedAnnouncementFor) {
          if (role === 'admin') {
            // Send to all admins
            const admins = await Admin.find({});
            admins.forEach(admin => {
              emailRecipients.push({
                email: admin.email,
                name: admin.name || 'Admin',
                registeredAs: 'Admin',
                message: `A new announcement has been made for administrators.`
              });
            });
          } else if (role === 'student') {
            if (classes && classes.length > 0 && !classes.includes('ALL')) {
              // Send to students in specific classes
              const students = await Student.find({ 
                class: { $in: classes } 
              });
              
              students.forEach(student => {
                emailRecipients.push({
                  email: student.email,
                  name: student.name,
                  registeredAs: 'Student',
                  message: `A new announcement has been made for your class (${student.class}).`
                });
              });
  
              // Send to guardians whose children are in these classes
              const guardians = await Guardian.find({ 
                'child.class': { $in: classes }
              });
              
              guardians.forEach(guardian => {
                // Get the first child class for the message, or use a generic message
                const childClass = guardian.childClass && guardian.childClass.length > 0 
                  ? guardian.childClass[0] 
                  : (guardian.child && guardian.child.length > 0 && guardian.child[0].class 
                      ? guardian.child[0].class 
                      : 'your child\'s class');
                
                emailRecipients.push({
                  email: guardian.email,
                  name: guardian.name,
                  registeredAs: 'Guardian',
                  message: `A new announcement has been made for your child's class (${childClass}).`
                });
              });
            } else {
              // Send to all students
              const students = await Student.find({});
              students.forEach(student => {
                emailRecipients.push({
                  email: student.email,
                  name: student.name,
                  registeredAs: 'Student',
                  message: `A new announcement has been made for you.`
                });
              });
  
              // Send to all guardians
              const guardians = await Guardian.find({});
              guardians.forEach(guardian => {
                emailRecipients.push({
                  email: guardian.email,
                  name: guardian.name,
                  registeredAs: 'Guardian',
                  message: `A new announcement has been made for your child.`
                });
              });
            }
          } else if (role === 'teacher') {
            // Send to all teachers
            const teachers = await Teacher.find({});
            teachers.forEach(teacher => {
              emailRecipients.push({
                email: teacher.email,
                name: teacher.name,
                registeredAs: 'Teacher',
                message: `A new announcement has been made for you.`
              });
            });
          } else if (role === 'parent' || role === 'guardian') {
            // Send to all guardians
            const guardians = await Guardian.find({});
            guardians.forEach(guardian => {
              emailRecipients.push({
                email: guardian.email,
                name: guardian.name,
                registeredAs: 'Guardian',
                message: `A new announcement has been made for you.`
              });
            });
          }
        }
      }
  
      // Remove duplicates based on email
      const uniqueRecipients = emailRecipients.filter((recipient, index, self) => 
        index === self.findIndex(r => r.email === recipient.email)
      );
    
  
      // Send emails
      const emailPromises = uniqueRecipients.map(recipient => {
        const mailOptions = {
          from: emailUser,
          to: recipient.email,
          subject: 'New Announcement - VK Publications',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
              <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 20px; border-radius: 10px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px;">VK Publications</h1>
                <p style="margin: 10px 0 0 0; font-size: 16px;">New Announcement</p>
              </div>
              <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin-top: 20px;">
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                  Dear ${recipient.name},
                </p>
                <p style="margin: 0 0 15px 0; font-size: 16px; color: #333;">
                  ${recipient.message}
                </p>
                               <div style="background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1e3c72; margin: 15px 0;">
                   <p style="margin: 0; font-size: 14px; color: #666; line-height: 1.6;">
                     ${truncatedText}
                   </p>
                 </div>
                               <p style="margin: 15px 0 0 0; font-size: 14px; color: #666;">
                   Please log in to your VK Publications portal to view the complete announcement with any attached images or documents.
                 </p>
                 ${announcementText.length > maxEmailLength ? 
                   '<p style="margin: 10px 0 0 0; font-size: 12px; color: #888; font-style: italic;">(This is a preview of the announcement. Full text and attachments available in the portal.)</p>' 
                   : ''
                 }
              </div>
              <div style="text-align: center; margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 8px;">
                <p style="margin: 0; font-size: 12px; color: #888;">
                  This is an automated message. Please do not reply to this email.
                </p>
              </div>
            </div>
          `
        };
  
        return transporter.sendMail(mailOptions).catch(error => {
          console.error(`Failed to send email to ${recipient.email}:`, error);
          return null; // Return null instead of throwing to continue with other emails
        });
      });
  
      // Wait for all emails to be sent
      const results = await Promise.allSettled(emailPromises);
      
      // Log results
      const successful = results.filter(result => result.status === 'fulfilled' && result.value !== null).length;
      const failed = results.filter(result => result.status === 'rejected' || result.value === null).length;
      
      
      return { successful, failed, total: uniqueRecipients.length };
    } catch (error) {
      console.error('Error sending announcement emails:', error);
      throw error;
    }
  };