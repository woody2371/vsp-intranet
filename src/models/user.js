export default class User {
	constructor({
		userId,
		email,
		firstName,
		lastName,
		location,
		phone,
		profilePicture,
		settings,
		title
	}) {
		this.userId = userId;
		this.email = email;
		this.firstName = firstName;
		this.lastName = lastName;
		this.location = location;
		this.phone = phone;
		this.profilePicture = profilePicture;
		this.settings = settings;
		this.title = title;
	}
}
