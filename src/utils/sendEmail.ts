import nodemailer from 'nodemailer';

export async function sendEmail(to: string, html: string) {
	// let testAccount = await nodemailer.createTestAccount();
	// console.log(testAccount);

	let transporter = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: 'iw6y34fqxwl6phec@ethereal.email', // generated ethereal user
			pass: 'YDNQzjT9ySGyEMwwSj', // generated ethereal password
		},
	});

	let info = await transporter.sendMail({
		from: 'iw6y34fqxwl6phec@ethereal.email', // sender address
		to, // list of receivers
		subject: 'Reset your beddit password', // Subject line
		text: 'Reset your beddit password here', // plain text body
		html, // html body
	});

	console.log('Message sent: %s', info.messageId);
	console.log(
		'Preview URL: %s',
		nodemailer.getTestMessageUrl(info)
	);
}
// {
//   user: 'iw6y34fqxwl6phec@ethereal.email',
//   pass: 'YDNQzjT9ySGyEMwwSj',
//   smtp: { host: 'smtp.ethereal.email', port: 587, secure: false },
//   imap: { host: 'imap.ethereal.email', port: 993, secure: true },
//   pop3: { host: 'pop3.ethereal.email', port: 995, secure: true },
//   web: 'https://ethereal.email'
// }
