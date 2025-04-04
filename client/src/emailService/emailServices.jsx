import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EmailService = async({file, userEmail, emailToSend, messageToSend }) => {

        // console.log(file)
        // console.log(userEmail)
        // console.log(emailToSend)
        // console.log(messageToSend)

        if (!emailToSend || !messageToSend) {
            toast.error("All fields are required!");
            return;
        }

        const formData = new FormData();
        formData.append("from", userEmail);
        formData.append("to", emailToSend);
        formData.append("text", messageToSend);
        formData.append("file", file);

        try {
            const response = await axios.post('api/files/email', formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            if (response.data.success) {
                toast.success("Email sent successfully!");
            } else {
                toast.error("Failed to send email!");
            }
        } catch (error) {
            toast.error("Error sending email!");
        }

};

export default EmailService;
