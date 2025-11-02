/**
 * Email Utilities
 * Nodemailer를 사용한 이메일 발송
 */

import nodemailer from 'nodemailer';

// 이메일 설정 (환경 변수에서 가져옴)
const EMAIL_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASSWORD || '',
  },
};

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@forum.com';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

/**
 * 이메일 전송용 transporter 생성
 */
const transporter = nodemailer.createTransport(EMAIL_CONFIG);

/**
 * 이메일 인증 메일을 발송합니다.
 *
 * @param email - 수신자 이메일 주소
 * @param token - 인증 토큰
 * @param nickname - 사용자 닉네임 (선택사항)
 *
 * @example
 * await sendVerificationEmail('user@example.com', 'verification-token', 'UserNickname');
 */
export async function sendVerificationEmail(
  email: string,
  token: string,
  nickname?: string
): Promise<void> {
  try {
    const verificationUrl = `${FRONTEND_URL}/verify-email/${token}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: '[커뮤니티 포럼] 이메일 인증을 완료해주세요',
      html: generateVerificationEmailTemplate(verificationUrl, nickname),
      text: `안녕하세요${nickname ? `, ${nickname}님` : ''}!\n\n커뮤니티 포럼에 가입해주셔서 감사합니다.\n\n아래 링크를 클릭하여 이메일 인증을 완료해주세요:\n${verificationUrl}\n\n이 링크는 24시간 동안 유효합니다.\n\n본인이 가입하지 않았다면 이 이메일을 무시하셔도 됩니다.\n\n감사합니다.\n커뮤니티 포럼 팀`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${email}`);
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
}

/**
 * 이메일 인증 템플릿 HTML 생성
 *
 * @param verificationUrl - 인증 URL
 * @param nickname - 사용자 닉네임 (선택사항)
 * @returns HTML 템플릿
 */
function generateVerificationEmailTemplate(
  verificationUrl: string,
  nickname?: string
): string {
  return `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>이메일 인증</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f4f4f4;
    }
    .container {
      background-color: #ffffff;
      border-radius: 10px;
      padding: 30px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 2px solid #4CAF50;
    }
    .header h1 {
      color: #4CAF50;
      margin: 0;
      font-size: 28px;
    }
    .content {
      padding: 30px 0;
    }
    .content p {
      margin: 15px 0;
      font-size: 16px;
    }
    .button {
      display: inline-block;
      padding: 15px 40px;
      background-color: #4CAF50;
      color: #ffffff !important;
      text-decoration: none;
      border-radius: 5px;
      font-size: 16px;
      font-weight: bold;
      text-align: center;
      margin: 20px 0;
    }
    .button:hover {
      background-color: #45a049;
    }
    .button-container {
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 20px;
      border-top: 1px solid #eee;
      font-size: 14px;
      color: #666;
    }
    .warning {
      background-color: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
    }
    .warning p {
      margin: 5px 0;
      font-size: 14px;
      color: #856404;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 환영합니다!</h1>
    </div>

    <div class="content">
      <p>안녕하세요${nickname ? `, <strong>${nickname}</strong>님` : ''}!</p>

      <p>커뮤니티 포럼에 가입해주셔서 감사합니다.</p>

      <p>아래 버튼을 클릭하여 이메일 인증을 완료해주세요:</p>

      <div class="button-container">
        <a href="${verificationUrl}" class="button">이메일 인증하기</a>
      </div>

      <p>또는 아래 링크를 복사하여 브라우저에 붙여넣으세요:</p>
      <p style="word-break: break-all; color: #4CAF50; font-size: 14px;">${verificationUrl}</p>

      <div class="warning">
        <p><strong>⏰ 중요:</strong> 이 링크는 24시간 동안만 유효합니다.</p>
        <p><strong>🔒 보안:</strong> 본인이 가입하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
      </div>
    </div>

    <div class="footer">
      <p>이 이메일은 자동으로 발송되었습니다.</p>
      <p>&copy; 2024 커뮤니티 포럼. All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * 비밀번호 재설정 이메일을 발송합니다.
 *
 * @param email - 수신자 이메일 주소
 * @param token - 재설정 토큰
 * @param nickname - 사용자 닉네임 (선택사항)
 */
export async function sendPasswordResetEmail(
  email: string,
  token: string,
  nickname?: string
): Promise<void> {
  try {
    const resetUrl = `${FRONTEND_URL}/reset-password/${token}`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: email,
      subject: '[커뮤니티 포럼] 비밀번호 재설정',
      html: `
        <h2>비밀번호 재설정</h2>
        <p>안녕하세요${nickname ? `, ${nickname}님` : ''}!</p>
        <p>비밀번호 재설정을 요청하셨습니다.</p>
        <p>아래 링크를 클릭하여 비밀번호를 재설정해주세요:</p>
        <a href="${resetUrl}" style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">비밀번호 재설정</a>
        <p>이 링크는 1시간 동안 유효합니다.</p>
        <p>본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.</p>
      `,
      text: `안녕하세요${nickname ? `, ${nickname}님` : ''}!\n\n비밀번호 재설정을 요청하셨습니다.\n\n아래 링크를 클릭하여 비밀번호를 재설정해주세요:\n${resetUrl}\n\n이 링크는 1시간 동안 유효합니다.\n\n본인이 요청하지 않았다면 이 이메일을 무시하셔도 됩니다.`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Password reset email sent to ${email}`);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}

/**
 * transporter 연결 테스트
 */
export async function testEmailConnection(): Promise<boolean> {
  try {
    await transporter.verify();
    console.log('Email server is ready to send messages');
    return true;
  } catch (error) {
    console.error('Error connecting to email server:', error);
    return false;
  }
}
