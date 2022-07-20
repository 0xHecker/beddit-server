import nodemailer from "nodemailer";

export async function sendEmail(to: string, html: string) {
	// let testAccount = await nodemailer.createTestAccount();
	// console.log(testAccount);

	let transporter = nodemailer.createTransport({
		host: "smtp.ethereal.email",
		port: 587,
		secure: false, // true for 465, false for other ports
		auth: {
			user: "oahxkpqdwkjpfqxn@ethereal.email", // generated ethereal user
			pass: "dv4xze8J7tyvYeSEjn", // generated ethereal password
		},
	});

	let info = await transporter.sendMail({
		from: '"Fred Foo" <foo@example.com>', // sender address
		to, // list of receivers
		subject: "Reset your beddit password", // Subject line
		text: "Hello world?", // plain text body
		html, // html body
	});

	console.log("Message sent: %s", info.messageId);
	console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
}
