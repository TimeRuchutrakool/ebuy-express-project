const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
      user: "xoxo.th.199@gmail.com", 
      pass: "wvpc kdzn avmb yeui" 
    }
  });

  exports.sendEmailOrderConfirmation = (email,orderId) => {
    const mailOptions = {
      from: {
        name: 'EBUY',
        address: 'xoxo.th.199@gmail.com'
    },
      to: email,
      subject: 'Order confirmation',
      html : `
      <div style= "display: flex;">
      <p style="font-size: 3.75rem; color: #DF2727; margin: 0;">e</p>
      <p style="font-size: 3.75rem; color: #0064D2; margin: 0;">b</p>
      <p style="font-size: 3.75rem; color: #F5AF02; margin: 0;">u</p>
      <p style="font-size: 3.75rem; color: #86B817; margin: 0;">y</p>
      </div>
        <h1>Dear Customer,</h1>
        <p>Your order with <strong>ORDER ID ${orderId}</strong> has been confirmed.</p>
        <img src="https://res.cloudinary.com/donk5keja/image/upload/v1700024492/fxvt9n82i0tq79ufi3am.png" alt="this slowpoke moves"  width="250" alt="404 image"/>
        <h3> Thank you for shopping with us !</h3>
        <p>Regards,<br>EBUY</p>
        
        </div>
      ` 
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('เกิดข้อผิดพลาดในการส่งอีเมล: ' + error);
      } else {
        console.log('ส่งอีเมลสำเร็จ: ' + info.response);
      }
    });
  }

  exports.sendEmailNotificationTrack = (email,track,logistic) => {
    const mailOptions = {
        from: {
          name: 'EBUY',
          address: 'xoxo.th.199@gmail.com'
      },
        to: email,
        subject: 'Track confirmation',
        html : `
        <div style= "display: flex;">
        <p style="font-size: 3.75rem; color: #DF2727; margin: 0;">e</p>
        <p style="font-size: 3.75rem; color: #0064D2; margin: 0;">b</p>
        <p style="font-size: 3.75rem; color: #F5AF02; margin: 0;">u</p>
        <p style="font-size: 3.75rem; color: #86B817; margin: 0;">y</p>
        </div>
          <h1> Dear Customer,</h1>
          <p> Your order with Track <strong>${track}</strong> has been confirmed.</p>
          <p> derivery with <strong>${logistic}</strong></p>
          <img src="https://res.cloudinary.com/donk5keja/image/upload/v1700017512/tvb5bekhg4fnkzfggucx.png" alt="this slowpoke moves"  width="250" alt="404 image"/>
          <p> Regards,<br>EBUY</p>
        </div>
        ` 
      };
    
      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('เกิดข้อผิดพลาดในการส่งอีเมล: ' + error);
        } else {
          console.log('ส่งอีเมลสำเร็จ: ' + info.response);
        }
      });
    }
