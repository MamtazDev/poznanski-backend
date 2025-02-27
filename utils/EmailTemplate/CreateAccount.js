const createAccount  = (email, token, name) => {
    const temp =  `    
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Our Platform</title>
    <style>
        /* Base Styles */
        body {
            background-color: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 40px;
            margin: 0;
        }
        table {
            max-width: 600px;
            width: 100%;
            background-color: #ffffff;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            text-align: center;
        }
        td {
            padding: 16px;
        }
        img {
            width: 64px;
            height: 64px;
            display: block;
            margin: 0 auto;
        }
        a {
            display: inline-block;
            background-color: #10b981;
            color: #ffffff;
            padding: 12px 32px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: medium;
            text-decoration: none;
        }
        hr {
            margin: 24px 0;
            border-color: #d1d5db;
        }
        .verification-link {
            color: black;
            font-size: 14px;
            font-weight: medium;
            background-color: #f3f4f6;
            padding: 12px;
            border-radius: 4px;
            word-wrap: break-word;
        }
        .footer-text {
            color: #9ca3af;
            font-size: 12px;
            margin-top: 24px;
        }

        /* Responsive Styles */
        @media (max-width: 425px) {
            body {
                padding: 20px;
            }
            table {
                padding: 20px;
            }
            td {
                padding: 12px;
            }
            a {
                padding: 10px 28px;
                font-size: 14px;
            }
            .verification-link {
                font-size: 12px;
                color:black
            }
        }

        /* Responsive Styles */
        @media (max-width: 768px) {
            body {
                padding: 20px;
            }
            table {
                padding: 20px;
            }
            td {
                padding: 12px;
            }
            a {
                padding: 10px 28px;
                font-size: 14px;
            }
            .verification-link {
                font-size: 12px;
                color:black
            }
        }
    </style>
</head>
<body>
    <table>
        <tr>
            <td>
                <img src="https://img.icons8.com/ios-filled/50/000000/user.png" alt="Welcome Icon">
            </td>
        </tr>
        <tr>
            <td style="font-size: 24px; font-weight: bold; color: #1f2937;">Welcome to Our Platform!</td>
        </tr>
        <tr>
            <td style="color: #4b5563; margin-top: 16px;">Thank you for creating an account with us. We're excited to have you onboard.</td>
        </tr>
        <tr>
            <td style="color: #4b5563; margin-top: 16px;">Click the button below to verify your email and activate your account:</td>
        </tr>
        <tr>
            <td>
                <a href="${token}" >Verify Account</a>
            </td>
        </tr>
        <tr>
            <td style="color: #4b5563; margin-top: 16px;">If you didn’t sign up for this account, you can ignore this email.</td>
        </tr>
        <tr>
            <td>
                <hr>
            </td>
        </tr>
        <tr>
            <td style="color: #6b7280; font-size: 14px;">If you're having trouble clicking the button, copy and paste the link below into your web browser:</td>
        </tr>
        <tr>
            <td class="verification-link">{{name}} hello</td>
        </tr>
        <tr>
            <td class="footer-text">&copy; 2024 Your Company. All rights reserved.</td>
        </tr>
    </table>
</body>
</html>
`


return temp
 }

module.exports = {
    createAccount
}