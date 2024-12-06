const nodemailer = require('nodemailer');
const crypto = require('crypto'); 

require('dotenv').config();

function generateCode() {
    return crypto.randomInt(100000, 999999).toString();
}

async function sendEmail(to, code) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Código de Verificação CasaMeet</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }

            .container {
                max-width: 600px;
                margin: 40px auto;
                padding: 30px;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }

            .header {
                text-align: center;
                margin-bottom: 30px;
            }

            .logo {
                width: 150px;
                margin-bottom: 20px;
            }

            h1 {
                color: #419C64;
                font-size: 24px;
                margin: 0 0 20px;
                text-align: center;
            }

            .code-container {
                display: flex;
                justify-content: center;
                gap: 8px;
                margin: 30px 0;
                margin-left: 95px;
                
            }

            .code-digit {
                background: #f8f9fa;
                border: 2px solid #419C64;
                border-radius: 8px;
                padding: 12px;
                font-size: 24px;
                font-weight: bold;
                color: #419C64;
                width: 40px;
                text-align: center;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
            }

            .message {
                text-align: center;
                color: #666;
                margin: 20px 0;
                font-size: 16px;
            }

            .warning {
                background: #fff3cd;
                color: #856404;
                padding: 12px;
                border-radius: 6px;
                margin-top: 20px;
                text-align: center;
                font-size: 14px;
            }

            .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #888;
                font-size: 14px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.ibb.co/HdGPGtz/Casa-Meet-logo.png" alt="CasaMeet Logo" class="logo">
                <h1>Verificação em Duas Etapas</h1>
            </div>

            <div class="message">
                Para continuar o acesso à sua conta, use o código abaixo:
            </div>

            <div class="code-container">
                ${code.split('').map(digit => `
                    <div class="code-digit">${digit}</div>
                `).join('')}
            </div>

            <div class="message">
                Este código é válido por 10 minutos.
            </div>

            <div class="footer">
                <p>Esta é uma mensagem automática, por favor não responda.</p>
                <p>&copy; ${new Date().getFullYear()} CasaMeet. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Código de Verificação CasaMeet',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de verificação enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar e-mail:', error);
        throw error;
    }
}

async function sendDenunciaConfirmationEmail(to, descricao) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Confirmação de Denúncia</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }

            .container {
                width: 100%;
                max-width: 600px;
                margin: 40px auto;
                padding: 40px;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            .header {
                margin-bottom: 30px;
            }

            h1 {
                color: #419C64;
                font-size: 28px;
                margin: 0 0 25px;
            }

            .content {
                text-align: left;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin: 20px 0;
            }

            .description {
                background: #fff;
                padding: 15px;
                border-radius: 6px;
                border-left: 4px solid #419C64;
                margin: 15px 0;
                font-style: italic;
            }

            .footer {
                margin-top: 35px;
                padding-top: 25px;
                border-top: 1px solid #eee;
                color: #888;
                font-size: 14px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.ibb.co/HdGPGtz/Casa-Meet-logo.png" alt="CasaMeet Logo" style="width: 180px; margin-bottom: 20px;">
                <h1>Confirmação de Denúncia</h1>
            </div>

            <div class="content">
                <p>Olá,</p>
                <p>Recebemos sua denúncia e já estamos analisando. Entraremos em contato em breve com mais informações.</p>
                <p>Descrição da denúncia:</p>
                <div class="description">
                    <p>${descricao}</p>
                </div>
            </div>

            <div class="footer">
                <p>Obrigado por nos ajudar a manter nossa comunidade segura.</p>
                <p>&copy; ${new Date().getFullYear()} CasaMeet. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Confirmação de Denúncia',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de confirmação de denúncia enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar e-mail de confirmação de denúncia:', error);
        throw error;
    }
}

async function sendDenunciaResponseEmail(to, denunciaId) {
    const transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_SECURE === 'true',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Resposta à sua Denúncia</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f5f5f5;
            }

            .container {
                width: 100%;
                max-width: 600px;
                margin: 40px auto;
                padding: 40px;
                background: #ffffff;
                border-radius: 12px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                text-align: center;
            }

            .header {
                margin-bottom: 30px;
            }

            h1 {
                color: #419C64;
                font-size: 28px;
                margin: 0 0 25px;
            }

            .content {
                text-align: left;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 8px;
                margin: 20px 0;
            }

            .denuncia-id {
                background: #e8f5e9;
                color: #419C64;
                padding: 10px;
                border-radius: 6px;
                display: inline-block;
                margin: 10px 0;
                font-weight: bold;
            }

            .footer {
                margin-top: 35px;
                padding-top: 25px;
                border-top: 1px solid #eee;
                color: #888;
                font-size: 14px;
                text-align: center;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://i.ibb.co/HdGPGtz/Casa-Meet-logo.png" alt="CasaMeet Logo" style="width: 180px; margin-bottom: 20px;">
                <h1>Resposta à sua Denúncia</h1>
            </div>

            <div class="content">
                <p>Olá,</p>
                <p>Sua denúncia <span class="denuncia-id">ID: ${denunciaId}</span> recebeu uma resposta de nossa equipe.</p>
                <p>Por favor, acesse o sistema para visualizar a resposta e obter mais informações.</p>
            </div>

            <div class="footer">
                <p>Agradecemos sua colaboração para manter nossa comunidade segura.</p>
                <p>&copy; ${new Date().getFullYear()} CasaMeet. Todos os direitos reservados.</p>
            </div>
        </div>
    </body>
    </html>
    `;

    const mailOptions = {
        from: process.env.EMAIL_FROM,
        to: to,
        subject: 'Resposta à sua Denúncia',
        html: htmlContent,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('E-mail de resposta à denúncia enviado com sucesso');
    } catch (error) {
        console.error('Erro ao enviar e-mail de resposta à denúncia:', error);
        throw error;
    }
}

module.exports = { generateCode, sendEmail, sendDenunciaConfirmationEmail, sendDenunciaResponseEmail };
