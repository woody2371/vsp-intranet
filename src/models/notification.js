import firebase from '../utils/firebase';
const region = process.env.REACT_APP_FIREBASE_FUNCTIONS_REGION;

export default class Notification {
	constructor({
		notificationId,
		emailData,
		link,
		metadata,
		page,
		recipient,
		title,
		type
	}) {
		this.notificationId = notificationId;
		this.emailData = emailData;
		this.link = link;
		this.metadata = metadata;
		this.page = page;
		this.recipient = recipient;
		this.title = title;
		this.type = type;
	}

	getDatabaseObject() {
		const databaseObject = { ...this };
		delete databaseObject.notificationId;
		return databaseObject;
	}

	async delete() {
		await firebase
			.firestore()
			.collection('notifications-new')
			.doc(this.notificationId)
			.delete();
	}

	async save() {
		this.metadata = {
			createdAt: firebase.firestore.FieldValue.serverTimestamp(),
			createdBy: firebase.auth().currentUser.uid,
			updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
			updatedBy: firebase.auth().currentUser.uid
		};
		const docRef = await firebase
			.firestore()
			.collection('notifications-new')
			.add(this.getDatabaseObject());
		this.notificationId = docRef.id;
	}

	static async saveAll(notifications) {
		const batch = firebase.firestore().batch();
		for (const notification of notifications) {
			notification.metadata = {
				createdAt: firebase.firestore.FieldValue.serverTimestamp(),
				createdBy: firebase.auth().currentUser.uid,
				updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
				updatedBy: firebase.auth().currentUser.uid
			};
			const docRef = firebase.firestore().collection('notifications-new').doc();
			batch.set(docRef, notification.getDatabaseObject());
		}
		await batch.commit();
	}

	static async deleteAll(notifications) {
		const batch = firebase.firestore().batch();
		for (const notification of notifications) {
			const docRef = firebase
				.firestore()
				.collection('notifications-new')
				.doc(notification.notificationId);
			batch.delete(docRef);
		}
		await batch.commit();
	}

	static getListener(userId) {
		const ONE_MONTH_MILLISECONDS = 2592000000;
		const ONE_MONTH_AGO_MILLISECONDS =
			new Date().getTime() - ONE_MONTH_MILLISECONDS;
		const ONE_MONTH_AGO_DATE = new Date(ONE_MONTH_AGO_MILLISECONDS);
		const ONE_MONTH_AGO_TIMESTAMP = firebase.firestore.Timestamp.fromDate(
			ONE_MONTH_AGO_DATE
		);

		return firebase
			.firestore()
			.collection('notifications-new')
			.where('recipient', '==', userId)
			.where('metadata.createdAt', '>=', ONE_MONTH_AGO_TIMESTAMP);
	}

	static async send(data) {
		const functionRef = firebase
			.app()
			.functions(region)
			.httpsCallable('sendNotificationNew');
		await functionRef(data);
	}
}
